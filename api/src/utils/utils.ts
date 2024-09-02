import { Rooms } from "./interfaces";
import { WebSocket } from "ws"

export const verifyRoomId = (rooms: Rooms, roomId: string, socket: WebSocket) => {
    const room: any = rooms.get(roomId);
    if (!room) {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid room id' }))
        return false
    }

    const socketVerified = Array.from(room.players.keys()).find((pl: any) => pl === socket)
    if (!socketVerified) {
        socket.send(JSON.stringify({ type: 'error', message: 'Unautorized' }))
        return false
    }

    return room
}