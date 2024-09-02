import createDeck from "./createDeck"
import { Card } from "./interfaces"

export class Deck {
    private deck: Card[] = []

    constructor() {
        this.deck = createDeck()
    }

    getOneCard = () => {
        return this.deck.splice(Math.floor(Math.random() * this.deck.length), 1)[0]
    }

    getFourCards = () => {
        const cards = []
        for(let i=0; i<4; i++){
            cards.push(this.getOneCard())
        }
        return cards
    }

    getFirstCard = () => {
        while (true) {
            const card = this.getOneCard()
            if (card.type === 'number') {
                console.log(this.deck.length);
                return card
            }
            this.deck.push(card)
        }
    }

    getPlayerCardset = () => {
        const cards = []
        for (let i = 0; i < 7; i++)
            cards.push(this.getOneCard())
        console.log(this.deck.length);
        return cards
    }
}