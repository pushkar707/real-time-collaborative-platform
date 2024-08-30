import deck from "./deck"

export const getOneCard = () => {
    return deck[Math.floor(Math.random() * deck.length)]
}

export const getPlayerCardset = () => {
    const cards = []
    for (let i = 0; i < 7; i++)
        cards.push(getOneCard())
    return cards
}