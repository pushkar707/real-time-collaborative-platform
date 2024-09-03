import React from 'react'
import CardBackImg from './CardBackImg'
import { useRecoilValue } from 'recoil'
import gameDataAtom from '../atoms/gameDataAtom'

const PlayerCards = ({ positionId, orientation, classes='' }: {positionId: number, orientation: 'horizontal' | 'vertical', classes?:string }) => {
    const gameData = useRecoilValue(gameDataAtom)
    return (
        <div className={`${classes} flex flex-col justify-center items-center gap-y-1.5`}>
            <div className={orientation === 'horizontal' ? 'flex' : ''}>
                {Array.from({ length: gameData.players.find((pl: any) => pl.id === positionId).cardsRemaining }).map((_, index) => {
                    return <CardBackImg orientation={orientation} isFirstImg={index === 0} />
                })}
            </div>
            <p className={`text-center font-medium text-lg mt-1.5 ${gameData.nextTurn === top && 'font-semibold underline'}`}>{gameData.players.find((pl: any) => pl.id === positionId).name}</p>
        </div>
    )
}

export default PlayerCards