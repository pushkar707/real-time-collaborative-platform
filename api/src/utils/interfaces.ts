import { WebSocket } from "ws";
import { Deck } from "./Deck";

export interface Card {
    type: 'number' | 'action' | 'wild'
    color?: string;
    number?: string;
    action?: string;
    wild?: string;
}

export interface Player {
    name: string;
    cards: Card[];
    id: number
}

export interface Room {
    players: Map<WebSocket, Player>;
    deck: Deck;
    hasGameStarted?: boolean;
    nextTurn?: number;
    lastCard?: Card;
    rotation?: 'clockwise' | 'anticlockwise';
    cardDrawn?: boolean;
}

export type Rooms = Map<string, Room>