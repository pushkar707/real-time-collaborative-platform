import React, { useEffect } from 'react'
import NumberCard from './NumberCard'
import ActionCard from './ActionCard'
import WildCard from './WildCard'
import { useRecoilState } from 'recoil'
import gameDataAtom from '../atoms/gameDataAtom'

const Card = ({ card, index }: { card: any, index:number }) => {

    const [gameData, setgameData] = useRecoilState(gameDataAtom)
    useEffect(() => {
        if(gameData.lastCard){
            console.log(gameData.lastCard);
        }
    },[gameData])

    if (card.type === 'number')
        return <NumberCard color={card.color} number={card.number} isFirstCard={index === 0} />
    else if (card.type === 'action')
        return <ActionCard action={card.action} color={card.color} isFirstCard={index === 0} />
    else if (card.type === 'wild')
        return <WildCard type={card.wild} isFirstCard={index === 0} />
}

export default Card