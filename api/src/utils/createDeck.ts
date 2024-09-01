import { Card } from "./interfaces";

const colors = ['red', 'yellow', 'green', 'blue'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const actions = ['skip', 'reverse', 'draw-Two'];
const wilds = ['wild', 'draw-four'];


export default () => {
    const deck: Card[] = []
    colors.forEach(color => {
        numbers.forEach(number => {
            deck.push({ type: 'number', color, number })
            if (number !== '0')
                deck.push({ type: 'number', color, number })
        })
        actions.forEach(action => {
            for (let i = 0; i < 2; i++)
                deck.push({ type: 'action', color, action })
        })
    })

    wilds.forEach(wild => {
        for (let i = 0; i < 4; i++)
            deck.push({ type: 'wild', wild })
    })
    return deck
}

