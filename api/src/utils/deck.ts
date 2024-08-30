const colors = ['Red', 'Yellow', 'Green', 'Blue'];
const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
const actions = ['Skip', 'Reverse', 'Draw Two'];
const wilds = ['Wild', 'Wild Draw Four'];

const deck: {}[] = []

colors.forEach(color => {
    numbers.forEach(number => {
        deck.push({ type: 'color-number', color, number })
        if (number !== '0')
            deck.push({ type: 'color-number', color, number })
    })
    actions.forEach(action => {
        for (let i = 0; i < 2; i++)
            deck.push({ type: 'color-action', color, action })
    })
})

wilds.forEach(wild => {
    for (let i = 0; i < 4; i++)
        deck.push({ type: 'wild', wild })
})
export default deck

