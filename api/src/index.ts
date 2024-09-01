import express, { Request, Response } from "express"
import Websocket, { WebSocketServer } from "ws"
import createRoomId from "./utils/createRoomId";
import createDeck from "./utils/createDeck";
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

            socket.send(JSON.stringify({ message: 'New room created', roomId, name: playerName, id, cards, players: [{ name: player.name, cardsRemaining: player.cards.length }] }))
            console.log(rooms);
        }

        else if (parseMsg.type === 'join-room') {
            const roomId = parseMsg.roomId
            // validate roomId
            const room: any = rooms.get(roomId);
            if (!room)
                socket.send(JSON.stringify({ error: 'Invalid room id' }))

            // Creating and adding player 2 that just joined
            const cards = room.deck.getPlayerCardset()
            const playerName = parseMsg.name
            const id = room.players.size + 1
            room.players.set(socket, { name: playerName, cards, id })
            rooms.set(roomId, room)
            console.log(rooms);

            // creating response for client
            const clientResponsePlayers: any[] = []
            room.players.forEach((player: any, socket: Websocket) => {
                clientResponsePlayers.push({ name: player.name, id: player.id, cardsRemaining: player.cards.length })
            })
            room.players.forEach((player: any, socket: Websocket) => {
                socket.send(JSON.stringify({ message: 'Connected to room', roomId, name: player.name, id:player.id, cards:player.cards, players: clientResponsePlayers }))
            })
        }
    })
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})