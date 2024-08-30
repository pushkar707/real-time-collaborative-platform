import createDeck from "./createDeck"
import deck from "./createDeck"
import { Card } from "./interfaces"

export class Deck {
    private deck: Card[] = []

    constructor() {
        this.deck = createDeck()
    }

    getOneCard = () => {
        return this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0]
    }

    getPlayerCardset = () => {
        const cards = []
        for (let i = 0; i < 7; i++)
            cards.push(this.getOneCard())
        console.log(this.deck.length);
        return cards
    }
}