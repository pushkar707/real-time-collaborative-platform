'use client'
import gameDataAtom from '@/app/atoms/gameDataAtom'
import Socket from '@/app/atoms/socket'
import ActionCard from '@/app/components/ActionCard'
import NumberCard from '@/app/components/NumberCard'
import WildCard from '@/app/components/WildCard'
import React, { act, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

const Page = () => {
  const [gameData, setgameData] = useRecoilState(gameDataAtom)
  const socket = useRecoilValue(Socket)
  const [left, setLeft] = useState<number>(0)
  const [top, setTop] = useState<number>(0)
  const [right, setRight] = useState<number>(0)
  useEffect(() => {
    socket && (socket.onmessage = (event) => {
      console.log(event.data);
      setgameData(JSON.parse(event.data))
    })
  }, [])

  useEffect(() => {
    if (!gameData)
      return
    const activePlayerId = gameData.id
    const length = gameData.players.length
    if (length === 2)
      setTop(activePlayerId === 1 ? 2 : 1)
    else if (length === 3) {
      setLeft(activePlayerId + 1 <= length ? activePlayerId + 1 : 1)
      setTop(activePlayerId + 2 <= length ? activePlayerId + 2 : activePlayerId - 1)
    }
    else if (length === 4) {
      setLeft(activePlayerId + 1 <= length ? activePlayerId + 1 : 1)
      setTop(activePlayerId + 2 <= length ? activePlayerId + 2 : activePlayerId - 2)
      setRight(0 < activePlayerId - 1 ? activePlayerId - 1 : length)
    }
  }, [gameData])

  return (
    gameData && <div className='flex h-screen items-center flex-col p-12 justify-between relative'>
      {top ? <div className='flex flex-col justify-center items-center gap-y-1.5'>
        <div className='flex'>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id === top).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-ml-[4.5vw]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className='text-center font-medium text-lg mt-1.5'>{gameData.players.find((pl: any) => pl.id === top).name}</p>
      </div> : <div></div>}

      <div className='flex'>
        <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
      </div>

      <div>
        <p className='text-center font-medium text-lg mb-1.5'>{gameData.name}</p>
        <div className='flex'>
          {gameData.cards.map((card: any, index: number) => {
            if (card.type === 'number')
              return <NumberCard color={card.color} number={card.number} isFirstCard={index === 0} />
            else if (card.type === 'action')
              return <ActionCard action={card.action} color={card.color} isFirstCard={index === 0} />
            else if (card.type === 'wild')
              return <WildCard type={card.wild} isFirstCard={index === 0} />
          })}
        </div>
      </div>

      {left ? <div className='flex absolute left-24 h-[90%] flex-col justify-center items-center gap-y-1.5'>
        <div>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id === left).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-mt-[17vh]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className='text-center font-medium text-lg'>{gameData.players.find((pl: any) => pl.id === left).name}</p>
      </div> : ''}

      {right ? <div className='flex absolute right-24 h-[90%] flex-col justify-center items-center gap-y-1.5'>
        <div>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id === right).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-mt-[17vh]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className='text-center font-medium text-lg'>{gameData.players.find((pl: any) => pl.id === right).name}</p>
      </div> : ''}
    </div>
  )
}

export default Page