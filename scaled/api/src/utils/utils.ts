import { redisClient } from "..";
import { Deck } from "./deck";
import { ParsedRoom, Player, Room, Rooms } from "./interfaces";
import { WebSocket } from "ws"

export const verifyRoomId = async (roomId: string, socket: WebSocket, player: Player) => {   
    // const room: any = rooms.get(roomId);
    const room = JSON.parse(await redisClient.hGet('rooms', roomId) || '')
    if (!room) {
        socket.send(JSON.stringify({ type: 'error', message: 'Invalid room id' }))
        return
    }

    const socketVerified = room.players.find((pl: Player) => JSON.stringify(pl) === JSON.stringify(player))
    if (!socketVerified) {
        socket.send(JSON.stringify({ type: 'error', message: 'Unauthorized' }))
        return
    }

    room.deck = new Deck(room.deck)
    return room
}

export const createPlayersResponse = (room: Room) => {
    const clientResponsePlayers: any[] = []
    room.players.forEach((player: Player) => {
        clientResponsePlayers.push({ name: player.name, id: player.id, cardsRemaining: player.cards.length })
    })
    return clientResponsePlayers
}

export const getNextTurn = (room: Room) => {
    if (!room.nextTurn)
        return 0

    if (room.rotation === 'clockwise')
        return room.nextTurn === room.players.length ? 1 : room.nextTurn + 1
    else
        return room.nextTurn === 1 ? room.players.length : room.nextTurn - 1
}

export const setRedisRoom = async(roomId: string, room: Room) => {
    await redisClient.hSet('rooms', roomId, JSON.stringify({...room, deck: room.deck.toParseableObject() }))
}

export const newPlayersDetails = (room:Room, currPlayer:Player) => {
    return room.players.map((pl: Player) => {
        if(pl.id === currPlayer.id){
            return currPlayer
        }
        return pl
    })
}