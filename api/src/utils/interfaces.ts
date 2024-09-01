import { WebSocket } from "ws";
import { Deck } from "./Deck";
export interface Card {
    type: 'number' | 'action' | 'wild'
    color?: string;
    number?: string;
    action?: string;
    wild?: string;
}

export interface Room {
    players: Map<WebSocket, { name: string, cards: Card }>
    deck: Deck
}

export type Rooms = Map<string, Room>