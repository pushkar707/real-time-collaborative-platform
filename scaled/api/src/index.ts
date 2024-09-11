import http from 'http';
import WebSocket, { WebSocketServer } from "ws"
import createRoomId from "./utils/createRoomId";
import { Deck } from "./utils/deck";
import { Card, Player, Room, Rooms } from "./utils/interfaces";
import { createPlayersResponse, getNextTurn, getRoomFromId, newPlayersDetails, setRedisRoom } from "./utils/utils";
import { createClient } from "redis"
import dotenv from "dotenv"
import { promise } from 'zod';
dotenv.config()

export const redisClient = createClient({ url: process.env.REDIS_URL })
const publisher = createClient({ url: process.env.REDIS_URL })
const subscriber = createClient({ url: process.env.REDIS_URL })
const server = http.createServer((req: any, res: any) => {
    res.end('Hi there')
})

const wss = new WebSocketServer({ server })

wss.on("connection", (socket: WebSocket) => {
    let roomId: string;
    let playerId: number;
    let isProcessingRequest = false
    console.log("socket connected");


    socket.on("message", async (message: string) => {
        const parseMsg = JSON.parse(message)
        if (isProcessingRequest) {
            console.log("Request already processing");
            return
        }

        isProcessingRequest = true;

        if (parseMsg.type === 'create-room') {
            // Creating Player1 that created the room 
            const deck = new Deck()
            const cards: Card[] = deck.getPlayerCardset()
            const playerName = parseMsg.name
            if (!playerName) {
                isProcessingRequest = false
                return socket.send(JSON.stringify({ type: 'error', message: 'Name is required for joining' }))
            }
            playerId = 1
            const player = { name: playerName, cards, id: playerId }

            // Creating room and saving its details in-memory
            roomId = await createRoomId()
            const room = { players: [player], deck: deck }
            await setRedisRoom(roomId, room)

            await subscriber.subscribe(roomId, (message: string, channel: any) => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(message);
                } else {
                    console.log(`Client ${playerId} is not connected or the connection is not open.`);
                }
            })

            await subscriber.pSubscribe(`${roomId}*${playerId}`, (message: string, channel: any) => {

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(message);
                } else {
                    console.log(`Client ${playerId} is not connected or the connection is not open.`);
                }
            })
            isProcessingRequest = false
            socket.send(JSON.stringify({ message: 'New room created', type: 'new', roomId, name: playerName, id: playerId, cards, players: [{ name: player.name, cardsRemaining: player.cards.length }] }))
        }

        else if (parseMsg.type === 'join-room') {
            const joiningRroomId = parseMsg.roomId
            // validate roomId
            const room = await getRoomFromId(joiningRroomId)
            if (!room || room.hasGameStarted) {
                isProcessingRequest = false
                return socket.send(JSON.stringify({ type: 'error', message: 'Invalid room id' }))
            }

            roomId = joiningRroomId
            // Creating and adding player that just joined
            const cards = room.deck.getPlayerCardset()
            const playerName = parseMsg.name
            if (!playerName) {
                isProcessingRequest = false
                return socket.send(JSON.stringify({ type: 'error', message: 'Name is required for joining' }))
            }
            playerId = room.players.length + 1
            room.players.push({ name: playerName, cards, id: playerId })
            await setRedisRoom(roomId, room)

            await subscriber.subscribe(roomId, (message: string, channel: any) => {
                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(message);
                } else {
                    console.log(`Client ${playerId} is not connected or the connection is not open.`);
                }
            })
            await subscriber.pSubscribe(`${roomId}*${playerId}`, (message: string, channel: any) => {

                if (socket.readyState === WebSocket.OPEN) {
                    socket.send(message);
                } else {
                    console.log(`Client ${playerId} is not connected or the connection is not open.`);
                }
            })
            isProcessingRequest = false
            socket.send(JSON.stringify({ message: 'Connected to room', type: 'new', roomId, name: playerName, id: playerId, cards, players: createPlayersResponse(room) }))
            await publisher.publish(roomId, JSON.stringify({ message: 'Connected to room', type: 'append', players: createPlayersResponse(room) }))
        }

        else if (parseMsg.type === 'start-game') {
            if (playerId !== 1) {
                isProcessingRequest = false
                return socket.send(JSON.stringify({ type: 'error', message: 'You cannot start the game' }))
            }

            const room: Room | undefined = await getRoomFromId(roomId)
            if (!room)
                return isProcessingRequest = false

            // validating enough players in room
            if (room.players.length <= 1) {
                isProcessingRequest = false
                return socket.send(JSON.stringify({ type: 'error', message: 'You need 2 to 4 players to play' }))
            }

            // creating firstCard and firstTurn
            const lastCard = room.deck.getFirstCard()
            const nextTurn = Math.ceil(Math.random() * room.players.length)

            room.lastCard = lastCard
            room.nextTurn = nextTurn
            room.rotation = 'clockwise'

            room['hasGameStarted'] = true
            await setRedisRoom(roomId, room)
            await publisher.publish(roomId, JSON.stringify({ message: 'Game started', type: 'append', hasGameStarted: true, lastCard, nextTurn }))
            isProcessingRequest = false
        }

        else if (parseMsg.type === 'move') {
            const room: Room | undefined = await getRoomFromId(roomId)
            if (!room)
                return isProcessingRequest = false

            const currPlayer: Player | undefined = room.players.find(pl => pl.id === playerId)

            if (!currPlayer || !room.hasGameStarted || !room.lastCard) {
                isProcessingRequest = false
                return socket.send(JSON.stringify({ message: 'Game has not started yet' }))
            }

            let socketResponse;

            if (parseMsg.move === 'draw-card') {
                if (room['cardDrawn']) {
                    isProcessingRequest = false
                    return socket.send(JSON.stringify({ type: 'error', message: 'You can only draw one card.' }))
                }

                if (room.nextTurn !== playerId) {
                    isProcessingRequest = false
                    return socket.send(JSON.stringify({ type: 'error', message: 'Not your turn' }))
                }

                // add check user can draw only one card, in-case they receive a correct card
                const card = room.deck.getOneCard();
                currPlayer.cards = [...currPlayer.cards, card]

                room.players = newPlayersDetails(room, currPlayer)

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
                else
                    room['cardDrawn'] = true

                socketResponse = { type: 'append', cards: currPlayer.cards, cardDrawn: room['cardDrawn'] }
            }
            else if (parseMsg.move === 'throw-card') {
                room['cardDrawn'] = false
                // pending: verify that user has thrown correct card
                const card: Card = parseMsg.card

                room.lastCard = card
                room.deck.throwCard(card)
                const removedCardIndex = currPlayer.cards.findIndex((playerCard: Card) => JSON.stringify(playerCard) === JSON.stringify(card))
                currPlayer.cards.splice(removedCardIndex, 1)
                room.players = newPlayersDetails(room, currPlayer)
                socketResponse = { type: 'append', cards: currPlayer.cards, cardDrawn: false }

                // throws an action card
                if (card.type === 'action') {
                    if (card.action === 'reverse') {
                        room.rotation = room.rotation === 'clockwise' ? 'anticlockwise' : 'clockwise'
                        if (room.players.length === 2)
                            room.nextTurn = getNextTurn(room)
                    }
                    else if (card.action === 'skip') {
                        room.nextTurn = getNextTurn(room)
                    }
                    else if (card.action === 'draw-two') {
                        const nextPlayerId = getNextTurn(room)
                        for (const player of room.players) {
                            if (player.id === nextPlayerId) {
                                const newCards = [...player.cards, room.deck.getOneCard(), room.deck.getOneCard()]
                                player.cards = newCards;
                                await publisher.publish(`${roomId}*${player.id}`, JSON.stringify({ type: 'append', cards: newCards }))
                                break;
                            }
                        }
                        room.players = newPlayersDetails(room, currPlayer)
                        room.nextTurn = nextPlayerId
                    }
                }
                else if (card.type === 'wild') {
                    const newColor = parseMsg.wildColor
                    room.lastCard.color = newColor
                    if (card.wild === 'draw-four') {
                        const nextPlayerId = getNextTurn(room)
                        for (const player of room.players) {
                            if (player.id === nextPlayerId) {
                                const newCards = [...player.cards, ...room.deck.getFourCards()]
                                player.cards = newCards;
                                await publisher.publish(`${roomId}*${player.id}`, JSON.stringify({ type: 'append', cards: newCards }))
                                break;
                            }
                        }
                        room.players = newPlayersDetails(room, currPlayer)
                        room.nextTurn = nextPlayerId
                    }
                }

                room.nextTurn = getNextTurn(room);
            }

            await setRedisRoom(roomId, room)
            socket.send(JSON.stringify(socketResponse))
            isProcessingRequest = false
            await publisher.publish(roomId, JSON.stringify({ message: `Player ${currPlayer.name} played a move`, type: 'append', nextTurn: room.nextTurn, lastCard: room.lastCard, players: createPlayersResponse(room) }))

            if (currPlayer.cards.length === 0) {
                await publisher.publish(roomId, JSON.stringify({ message: `Player ${currPlayer.name} won the game`, gameOver: true, isAnnouncement: true, type: 'append', lastCard: room.lastCard, players: createPlayersResponse(room) }))
                await redisClient.hDel('rooms', roomId)
                await subscriber.unsubscribe(roomId);
            }
        }

        else if (parseMsg.type === 'reconnect') { // restore game state if server restarts 
            console.log(parseMsg);
            roomId = parseMsg.prevRoomId
            playerId = parseInt(parseMsg.prevPlayerId)

            const room: Room = await getRoomFromId(roomId)
            if (!room)
                return socket.send(JSON.stringify({ type: 'error', message: 'Could not find the game, please start a new game' }))

            const player = room.players.find(pl => pl.id == playerId)
            if (!player)
                return socket.send(JSON.stringify({ type: 'error', message: 'Invalid reconnect request' }))
            await subscriber.subscribe(roomId, (message: string, channel: any) => {
                if (socket.readyState === WebSocket.OPEN)
                    socket.send(message);
                else
                    console.log(`Client ${playerId} is not connected or the connection is not open.`);
            })
            await subscriber.pSubscribe(`${roomId}*${playerId}`, (message: string, channel: any) => {
                if (socket.readyState === WebSocket.OPEN)
                    socket.send(message);
                else
                    console.log(`Client ${playerId} is not connected or the connection is not open.`);
            })
            isProcessingRequest = false
            socket.send(JSON.stringify({ message: 'Re-connected to room', type: 'new', lastCard: room.lastCard, hasGameStarted: room.hasGameStarted, cardDrawn: room.cardDrawn, nextTurn: room.nextTurn, roomId, name: player.name, id: playerId, cards: player.cards, players: createPlayersResponse(room) }))
        }
    })

    socket.on('close', async () => {
        console.log('Socket disconnected');
        if (!roomId || !playerId)
            return
        const room = await getRoomFromId(roomId)
        if (!room)
            return
        let leftPlayer: Player | undefined;

        room.players = room.players.filter((player: Player) => {
            if (player.id === playerId)
                leftPlayer = player
            return player.id !== playerId
        }).map((player: Player, index: number) => {
            return { ...player, id: index + 1 }
        })

        if (room.players.length === 0) {
            await subscriber.unsubscribe(roomId)
            return await redisClient.hDel('rooms', roomId)
        }

        if (!leftPlayer)
            return
        room.deck.returnPlayerCard(leftPlayer.cards)
        await publisher.publish(roomId, JSON.stringify({ message: `Player ${leftPlayer.name} left the game`, playerLeft: true, isAnnouncement: true, type: 'append', players: createPlayersResponse(room) }))
        await setRedisRoom(roomId, room)
    })
})

const startServer = async () => {
    await redisClient.connect();
    await publisher.connect()
    await subscriber.connect()
    server.listen(process.env.PORT || 3000, () => {
        console.log("Web socket server running");
    })
}

startServer()

// PROJECT TODOS
// send socket response after completing redis stuff, so that user doesn't keep making requests
// Debouncing on client to make make new request only once response received
// host the projects using AWS ASGs, and aiven redis
// Add voice call between sockets using webRTC
// Add testing and monitoring for backend
// Host the application using k8s


// POLISHING TODOS
// Add pub-sub for modifying id at the top after player left
// animations in UI