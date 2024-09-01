import express, { Request, Response } from "express"
import Websocket, { WebSocketServer } from "ws"
import createRoomId from "./utils/createRoomId";
import { Deck } from "./utils/Deck";
import { Rooms } from "./utils/interfaces";

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

            // creating response
            const clientResponsePlayers: any[] = []
            room.players.forEach((player: any, socket: Websocket) => {
                clientResponsePlayers.push({ name: player.name, id: player.id, cardsRemaining: player.cards.length })
            })

            // sending new players details to all sockets
            room.players.forEach((player: any, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Connected to room', type: 'new', roomId, name: player.name, id: player.id, cards: player.cards, players: clientResponsePlayers }))
            })
        }

        else if (parseMsg.type === 'start-game') {
            const roomId = parseMsg.roomId
            // validate roomId
            const room: any = rooms.get(roomId);
            if (!room)
                return socket.send(JSON.stringify({ type: 'error', message: 'Invalid room id' }))

            const socketVerified = Array.from(room.players.keys()).find((pl: any) => pl === socket)
            if (!socketVerified)
                return socket.send(JSON.stringify({ type: 'error', message: 'Unautorized' }))

            // validating enough players in room
            if (room.players.length <= 1)
                socket.send(JSON.stringify({ type: 'error', message: 'You need 2 to 4 players to play' }))

            // creating firstCard and firstTurn
            const lastCard = room.deck.getOneCard()
            const lastTurn = Math.floor(Math.random() * room.players.size) + 1

            room['hasGameStarted'] = true
            rooms.set(roomId, room)

            room.players.forEach((player: any, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Game started', type: 'append', lastCard, lastTurn }))
            })
        }
    })
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})