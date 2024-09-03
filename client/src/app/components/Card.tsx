import React, { useEffect, useState } from 'react'
import NumberCard from './NumberCard'
import ActionCard from './ActionCard'
import WildCard from './WildCard'
import { useRecoilState, useRecoilValue } from 'recoil'
import gameDataAtom from '../atoms/gameDataAtom'
import socketAtom from '../atoms/socket'

const Card = ({ card, index, isCenterCard = false }: { card: any, index: number, isCenterCard?: boolean }) => {

    const gameData = useRecoilValue(gameDataAtom)
    const socket = useRecoilValue(socketAtom)
    const [showWildColorPopup, setShowWildColorPopup] = useState(false)
    useEffect(() => {
        if (gameData.lastCard) {
        }
    }, [gameData])


    const isEligibleCard = !isCenterCard && gameData?.nextTurn && gameData?.nextTurn === gameData?.id && (
        (card.type === 'wild') || (card.color && (card.color === gameData?.lastCard?.color)) || (card.number && (card.number === gameData?.lastCard?.number)) || (card.action && (card.action === gameData?.lastCard?.action))
    )

    const makeMove = () => {
        if (!isEligibleCard)
            return

        if (card.type === 'wild') {
            return setShowWildColorPopup(true)
        }

        socket?.send(JSON.stringify({ type: 'move', move: 'throw-card', roomId: gameData.roomId, card }))
    }

    const setWildColorFunc = (color: string) => {
        socket?.send(JSON.stringify({ type: 'move', move: 'throw-card', roomId: gameData.roomId, card, wildColor: color }))
        setShowWildColorPopup(false)
    }

    if (showWildColorPopup) {
        return <div className='absolute w-screen h-screen top-0 left-0 z-10 bg-gray-100 bg-opacity-90 flex justify-center items-center'>
            <div className='bg-white px-8 py-6 rounded-md shadow '>
                <p className='mb-4 text-center font-medium text-lg'>
                    Select the new color
                </p>
                <div className='flex gap-x-6'>
                    <div onClick={() => setWildColorFunc('green')} className='bg-green-500 w-10 h-10 cursor-pointer'></div>
                    <div onClick={() => setWildColorFunc('yellow')} className='bg-yellow-500 w-10 h-10 cursor-pointer'></div>
                    <div onClick={() => setWildColorFunc('blue')} className='bg-blue-500 w-10 h-10 cursor-pointer'></div>
                    <div onClick={() => setWildColorFunc('red')} className='bg-red-500 w-10 h-10 cursor-pointer'></div>
                </div>
            </div>
        </div>
    }

    return <div onClick={makeMove} className={`${index !== 0 && '-ml-[4.5vw]'} ${isEligibleCard && 'move-avaliable'} outline-1 relative border-white border-4 outline-slate-800 outline border-box rounded-xl w-[8vw] text-white h-[20vh]`}>
        {card.type === 'number' ? <NumberCard color={card.color} number={card.number} /> :
            card.type === 'action' ? <ActionCard action={card.action} color={card.color} /> :
                card.type === 'wild' ? <WildCard type={card.wild} /> : ''}
    </div>

}

export default Card