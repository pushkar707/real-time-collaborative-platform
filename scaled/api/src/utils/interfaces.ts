import { WebSocket } from "ws";
import { Deck } from "./deck";

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
    players: Player[];
    deck: Deck;
    hasGameStarted?: boolean;
    nextTurn?: number;
    lastCard?: Card;
    rotation?: 'clockwise' | 'anticlockwise';
    cardDrawn?: boolean;
}

export interface ParsedDeck {
    deck: Card[];
    cardsThrown: Card[]
}

export interface ParsedRoom {
    players: Player[];
    deck: ParsedDeck;
    hasGameStarted?: boolean;
    nextTurn?: number;
    lastCard?: Card;
    rotation?: 'clockwise' | 'anticlockwise';
    cardDrawn?: boolean;
}

export type Rooms = Map<string, Room>