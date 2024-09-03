import createDeck from "./createDeck"
import { Card } from "./interfaces"

export class Deck {
    private deck: Card[] = []
    private cardsThrown: Card[] = []

    constructor() {
        this.deck = createDeck()
    }

    throwCard = (card: Card) => {
        console.log(this.deck.length);
        this.cardsThrown.push(card)
    }

    replensishDeck = () => {
        this.deck.push(...this.cardsThrown.slice(0, -1))
        this.cardsThrown = []
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
}