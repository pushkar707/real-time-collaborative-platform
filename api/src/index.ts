import express, { Request, Response } from "express"
import Websocket, { WebSocketServer } from "ws"
import createRoomId from "./utils/createRoomId";
import { Deck } from "./utils/Deck";
import { Card, Player, Room, Rooms } from "./utils/interfaces";
import { createPlayersResponse, getNextTurn, verifyRoomId } from "./utils/utils";

const app = express()
const server = app.listen(3000, () => {
    console.log("Running on port 3000");
})

const wss = new WebSocketServer({ server })
export const rooms: Rooms = new Map()

wss.on("connection", (socket) => {
    socket.on("message", (message: string) => {
        const parseMsg = JSON.parse(message)

        if (parseMsg.type === 'create-room') {
            // Creating Player1 that created the room 
            const deck = new Deck()
            const cards: Card[] = deck.getPlayerCardset()
            const players = new Map();
            const playerName = parseMsg.name
            const id = 1
            const player = { name: playerName, cards, id }
            players.set(socket, player)

            // Creating room and saving its details in-memory
            const roomId = createRoomId()
            rooms.set(roomId, { players, deck })
            socket.send(JSON.stringify({ message: 'New room created', type: 'new', roomId, name: playerName, id, cards, players: [{ name: player.name, cardsRemaining: player.cards.length }] }))
        }

        else if (parseMsg.type === 'join-room') {
            console.log("Room join request");
            
            const roomId = parseMsg.roomId
            // validate roomId
            const room: Room | undefined = rooms.get(roomId);
            if (!room || room.hasGameStarted)
                return socket.send(JSON.stringify({ type: 'error', message: 'Invalid room id' }))

            // Creating and adding player that just joined
            const cards = room.deck.getPlayerCardset()
            const playerName = parseMsg.name
            const id = room.players.size + 1
            room.players.set(socket, { name: playerName, cards, id })
            rooms.set(roomId, room)

            // sending new players details to all sockets
            room.players.forEach((player: Player, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Connected to room', type: 'new', roomId, name: player.name, id: player.id, cards: player.cards, players: createPlayersResponse(room) }))
            })
        }

        else if (parseMsg.type === 'start-game') {
            const roomId = parseMsg.roomId
            const room: Room = verifyRoomId(rooms, roomId, socket)
            if (!room)
                return

            // validating enough players in room
            if (room.players.size <= 1)
                socket.send(JSON.stringify({ type: 'error', message: 'You need 2 to 4 players to play' }))

            // creating firstCard and firstTurn
            const lastCard = room.deck.getFirstCard()
            const nextTurn = Math.ceil(Math.random() * room.players.size)

            room.lastCard = lastCard
            room.nextTurn = nextTurn
            room.rotation = 'clockwise'

            room['hasGameStarted'] = true
            rooms.set(roomId, room)

            room.players.forEach((player: Player, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Game started', type: 'append', hasGameStarted: true, lastCard, nextTurn }))
            })
        }

        else if (parseMsg.type === 'move') {
            const roomId = parseMsg.roomId
            const room: Room = verifyRoomId(rooms, roomId, socket)
            if (!room)
                return

            const currPlayer = room.players.get(socket)
            if (!currPlayer || currPlayer.id !== room.nextTurn)
                return socket.send(JSON.stringify({ message: 'Invalid turn' }))

            if (!room.hasGameStarted || !room.lastCard)
                return socket.send(JSON.stringify({ message: 'Game has not started yet' }))

            if (parseMsg.move === 'draw-card') {
                if(room['cardDrawn'])
                    return socket.send(JSON.stringify({type: 'error', message: 'You can only draw one card.'}))
                // add check user can draw only one card, in-case they receive a correct card
                const card = room.deck.getOneCard();
                currPlayer.cards = [...currPlayer.cards, card]
                room['cardDrawn'] = true

                // checking if users has any card after drawing, if not go to next player
                let noEligibleCard = true;
                for (let card of currPlayer.cards) {
                    if ((card.type === 'wild') || (card.color && (card.color === room.lastCard.color)) || (card.number && (card.number === room.lastCard.number)) || (card.action && (card.action === room.lastCard.action))) {
                        noEligibleCard = false
                        break;
                    }
                }
                if (noEligibleCard)
                    room.nextTurn = getNextTurn(room)

                socket.send(JSON.stringify({ type: 'append', cards: currPlayer.cards, cardDrawn:true }))
            }
            else if (parseMsg.move === 'throw-card') {
                room['cardDrawn'] = false
                // pending: verify that user has thrown correct card
                const card: Card = parseMsg.card

                room.lastCard = card
                room.deck.throwCard(card)
                const removedCardIndex = currPlayer.cards.findIndex((playerCard: Card) => JSON.stringify(playerCard) === JSON.stringify(card))
                currPlayer.cards.splice(removedCardIndex, 1)
                socket.send(JSON.stringify({ type: 'append', cards: currPlayer.cards, cardDrawn:false }))

                // throws an action card
                if (card.type === 'action') {
                    if (card.action === 'reverse') {
                        room.rotation = room.rotation === 'clockwise' ? 'anticlockwise' : 'clockwise'
                        if (room.players.size === 2)
                            room.nextTurn = getNextTurn(room)
                    }
                    else if (card.action === 'skip') {
                        room.nextTurn = getNextTurn(room)
                    }
                    else if (card.action === 'draw-two') {
                        const nextPlayerId = getNextTurn(room)
                        for (const [loopSocket, player] of room.players.entries()) {
                            if (player.id === nextPlayerId) {
                                const newCards = [...player.cards, room.deck.getOneCard(), room.deck.getOneCard()]
                                player.cards = newCards;
                                loopSocket.send(JSON.stringify({ type: 'append', cards: newCards }))
                                break;
                            }
                        }
                        room.nextTurn = nextPlayerId
                    }
                }
                else if (card.type === 'wild') {
                    const newColor = parseMsg.wildColor
                    room.lastCard.color = newColor
                    if (card.wild === 'draw-four') {
                        const nextPlayerId = getNextTurn(room)
                        for (const [loopSocket, player] of room.players.entries()) {
                            if (player.id === nextPlayerId) {
                                const newCards = [...player.cards, ...room.deck.getFourCards()]
                                player.cards = newCards;
                                loopSocket.send(JSON.stringify({ type: 'append', cards: newCards }))
                                break;
                            }
                        }
                        room.nextTurn = nextPlayerId
                    }
                }

                room.nextTurn = getNextTurn(room);
            }

            rooms.set(roomId, room)
            room.players.forEach((player: Player, socket: Websocket) => {
                socket.send(JSON.stringify({ message: `Player ${currPlayer.name} played a move`, type: 'append', nextTurn: room.nextTurn, lastCard: room.lastCard, players: createPlayersResponse(room) }))
            })

            if (currPlayer.cards.length === 0) {
                return room.players.forEach((player: Player, socket: Websocket) => {
                    return socket.send(JSON.stringify({ message: `Player ${currPlayer.name} won the game`, isAnnouncement: true, type: 'append', lastCard: room.lastCard, players: createPlayersResponse(room) }))
                })
            }
        }
    })
    console.log('socket connected');
    
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})

// TODO
// Debouncing on client to make make new request only once response received
// share link and popup to join the game
// hosting
// animations in UI