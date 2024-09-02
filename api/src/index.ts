import express, { Request, Response } from "express"
import Websocket, { WebSocketServer } from "ws"
import createRoomId from "./utils/createRoomId";
import { Deck } from "./utils/Deck";
import { Rooms } from "./utils/interfaces";
import { createPlayersResponse, verifyRoomId } from "./utils/utils";

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
            const cards: any = deck.getPlayerCardset()
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
            const roomId = parseMsg.roomId
            // validate roomId
            const room: any = rooms.get(roomId);
            if (!room || room.hasGameStarted)
                return socket.send(JSON.stringify({ type: 'error', message: 'Invalid room id' }))

            // Creating and adding player that just joined
            const cards = room.deck.getPlayerCardset()
            const playerName = parseMsg.name
            const id = room.players.size + 1
            room.players.set(socket, { name: playerName, cards, id })
            rooms.set(roomId, room)

            // sending new players details to all sockets
            room.players.forEach((player: any, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Connected to room', type: 'new', roomId, name: player.name, id: player.id, cards: player.cards, players: createPlayersResponse(room) }))
            })
        }

        else if (parseMsg.type === 'start-game') {
            const roomId = parseMsg.roomId
            const room = verifyRoomId(rooms, roomId, socket)
            if (!room)
                return

            // validating enough players in room
            if (room.players.length <= 1)
                socket.send(JSON.stringify({ type: 'error', message: 'You need 2 to 4 players to play' }))

            // creating firstCard and firstTurn
            const lastCard = room.deck.getFirstCard()
            const lastTurn = Math.floor(Math.random() * room.players.size) + 1

            room.lastCard = lastCard
            room.lastTurn = lastTurn

            room['hasGameStarted'] = true
            rooms.set(roomId, room)

            room.players.forEach((player: any, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Game started', type: 'append', lastCard, lastTurn }))
            })
        }

        else if (parseMsg.type === 'move') {
            const roomId = parseMsg.roomId
            const room = verifyRoomId(rooms, roomId, socket)
            if (!room)
                return

            const currPlayer = room.players.get(socket)
            if (currPlayer.id !== room.lastTurn)
                return socket.send(JSON.stringify({ message: 'Invlid turn' }))

            if (!room.hasGameStarted)
                return socket.send(JSON.stringify({ message: 'Game has not started yet' }))

            if (parseMsg.move === 'draw-card') {
                const card = room.deck.getOneCard();
                currPlayer.cards = [...currPlayer.cards, card]
                room.players.set(socket, currPlayer)
                socket.send(JSON.stringify({ type: 'append', cards: currPlayer.cards }))
            }

            rooms.set(roomId, room)
            room.players.forEach((player: any, socket: Websocket) => {
                socket.send(JSON.stringify({ message: `Player ${currPlayer.name} drawed a card`, type: 'append', players: createPlayersResponse(room) }))
            })
        }

        console.log(rooms);

    })
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})