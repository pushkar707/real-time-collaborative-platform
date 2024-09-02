import React, { useEffect, useState } from 'react'
import NumberCard from './NumberCard'
import ActionCard from './ActionCard'
import WildCard from './WildCard'
import { useRecoilState, useRecoilValue } from 'recoil'
import gameDataAtom from '../atoms/gameDataAtom'
import socketAtom from '../atoms/socket'

const Card = ({ card, index, isCenterCard = false }: { card: any, index: number, isCenterCard?: boolean }) => {

    const [gameData, setgameData] = useRecoilState(gameDataAtom)
    const socket = useRecoilValue(socketAtom)
    useEffect(() => {
        if (gameData.lastCard) {
            console.log(gameData.lastCard);
        }
    }, [gameData])

    const isEligibleCard = !isCenterCard && gameData?.lastTurn && gameData?.lastTurn === gameData?.id && (
        (card.type === 'wild') || (card.color && (card.color === gameData?.lastCard?.color)) || (card.number && (card.number === gameData?.lastCard?.number)) || (card.action && (card.action === gameData?.lastCard?.action))
    )

    const makeMove = () => {
        if (!isEligibleCard)
            return

        socket?.send(JSON.stringify({ type: 'move', move: 'throw-card', roomId: gameData.roomId, card }))
    }


    return <div onClick={makeMove} className={`${index !== 0 && '-ml-[4.5vw]'} ${isEligibleCard && 'move-avaliable'} outline-1 relative border-white border-4 outline-slate-800 outline border-box rounded-xl w-[8vw] text-white h-[20vh]`}>
        {card.type === 'number' ? <NumberCard color={card.color} number={card.number} /> :
            card.type === 'action' ? <ActionCard action={card.action} color={card.color} /> :
                card.type === 'wild' ? <WildCard type={card.wild} /> : ''}
    </div>

}

export default Card