import express, { Request, Response } from "express"
import Websocket, { WebSocketServer } from "ws"
import createRoomId from "./utils/createRoomId";
import { getPlayerCardset } from "./utils/getCards";

const app = express()
const server = app.listen(3000, () => {
    console.log("Running on port 3000");
})

const wss = new WebSocketServer({ server })
export const rooms = new Map()

wss.on("connection", (socket) => {
    socket.on("message", (message: string) => {
        const parseMsg = JSON.parse(message)

        if (parseMsg.type === 'create-room') {
            const roomId = createRoomId()
            const cards: any = getPlayerCardset()
            const room = new Map();
            const player = { name: parseMsg.name, cards }
            room.set(socket, player)
            rooms.set(roomId, room)
            socket.send(JSON.stringify({ message: 'New room created', roomId, cards, players: [player] }))
            console.log(rooms);
        }

        else if (parseMsg.type === 'join-room') {
            const roomId = parseMsg.roomId
            if (!rooms.has(roomId))
                socket.send('Invalid room Id, please try again')
            const roomMembers: Map<Websocket, {}> = rooms.get(roomId);
            if(!roomMembers)
                socket.send(JSON.stringify({error: 'Invalid room id'}))
            const cards = getPlayerCardset()
            roomMembers.set(socket, { name: parseMsg.name, cards })
            const players: any[] = []
            roomMembers.forEach((player, socket) => { // value, key
                players.push(player)
            })
            socket.send(JSON.stringify({ message: 'Connected to room', roomId, cards, players }))
            rooms.set(roomId, roomMembers)
            console.log(rooms);
        }

    })
    socket.send(JSON.stringify({ message: 'Connected to ws server' }))
})

app.get('/', (req: Request, res: Response) => {
    return res.send('API healthy')
})