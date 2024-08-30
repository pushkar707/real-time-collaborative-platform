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
            const player = { name: parseMsg.name, cards }
            players.set(socket, player)
            
            // Creating room and saving its details in-memory
            const roomId = createRoomId()
            rooms.set(roomId, { players, deck })

            socket.send(JSON.stringify({ message: 'New room created', roomId, cards, players: [{ name: player.name, cardRemaining: player.cards.length }] }))
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
            room.players.set(socket, { name: parseMsg.name, cards })
            rooms.set(roomId, room)
            console.log(rooms);

            // creating response for client
            const clientResponsePlayers: any[] = []
            room.players.forEach((player: any, socket: Websocket) => {
                clientResponsePlayers.push({ name: player.name, cardRemaining: player.cards.length })
            })
            socket.send(JSON.stringify({ message: 'Connected to room', roomId, cards, players:clientResponsePlayers }))
        }
    })
    socket.send(JSON.stringify({ message: 'Connected to ws server' }))
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})