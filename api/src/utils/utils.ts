import { Room, Rooms } from "./interfaces";
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

export const createPlayersResponse = (room: Room) => {
    const clientResponsePlayers: any[] = []
    room.players.forEach((player: any, socket: WebSocket) => {
        clientResponsePlayers.push({ name: player.name, id: player.id, cardsRemaining: player.cards.length })
    })
    return clientResponsePlayers
}

export const getNextTurn = (room: Room) => {
    if (!room.nextTurn)
        return 0

    if (room.rotation === 'clockwise')
        return room.nextTurn === room.players.size ? 1 : room.nextTurn + 1
    else
        return room.nextTurn === 1 ? room.players.size : room.nextTurn - 1
}