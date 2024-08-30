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
            const roomId = createRoomId()
            const deck = new Deck()
            const cards: any = deck.getPlayerCardset()
            const players = new Map();
            const player = { name: parseMsg.name, cards }
            players.set(socket, player)
            rooms.set(roomId, { players, deck })
            socket.send(JSON.stringify({ message: 'New room created', roomId, cards, players: [{ name: player.name, cardRemaining: player.cards.length }] }))
            console.log(rooms);
        }

        else if (parseMsg.type === 'join-room') {
            const roomId = parseMsg.roomId
            if (!rooms.has(roomId))
                socket.send('Invalid room Id, please try again')

            const room: any = rooms.get(roomId);
            if (!room)
                socket.send(JSON.stringify({ error: 'Invalid room id' }))

            const cards = room.deck.getPlayerCardset()
            room.players.set(socket, { name: parseMsg.name, cards })
            const players: any[] = []
            room.players.forEach((player: any, socket: Websocket) => {
                players.push({ name: player.name, cardRemaining: player.cards.length })
            })
            socket.send(JSON.stringify({ message: 'Connected to room', roomId, cards, players }))
            rooms.set(roomId, room)
            console.log(rooms);
        }
    })
    socket.send(JSON.stringify({ message: 'Connected to ws server' }))
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})