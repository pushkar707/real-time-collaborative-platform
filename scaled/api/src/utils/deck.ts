import createDeck from "./createDeck"
import { Card, ParsedDeck } from "./interfaces"

export class Deck {
    private deck: Card[] = []
    private cardsThrown: Card[] = []

    constructor(oldDeck?: ParsedDeck) {
        if (oldDeck) {
            this.deck = oldDeck.deck
            this.cardsThrown = oldDeck.cardsThrown
            return
        }
        this.deck = createDeck()
    }

    throwCard = (card: Card) => {
        this.cardsThrown.push(card)
    }

    replensishDeck = () => {
        this.deck.push(...this.cardsThrown.slice(0, -1))
        this.cardsThrown = []
    }

    returnPlayerCard = (cards: Card[]) => {
        this.deck.push(...cards)
    }

    getOneCard = () => {
        if (this.deck.length <= 4) {
            console.log("Deck replensihed");
            this.replensishDeck()
        }
        return this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0]
    }

    getFourCards = () => {
        const cards = []
        for (let i = 0; i < 4; i++) {
            cards.push(this.getOneCard())
        }
        return cards
    }

    getFirstCard = () => {
        while (true) {
            const card = this.getOneCard()
            if (card.type === 'number') {
                return card
            }
            this.deck.push(card)
        }
    }

    getPlayerCardset = () => {
        const cards = []
        for (let i = 0; i < 7; i++)
            cards.push(this.getOneCard())
        return cards
    }

    toParseableObject = () => {
        return { deck: this.deck, cardsThrown: this.cardsThrown }
    }
}