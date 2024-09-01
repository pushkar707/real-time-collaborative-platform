'use client'
import Socket from '@/app/atoms/Socket'
import ActionCard from '@/app/components/ActionCard'
import NumberCard from '@/app/components/NumberCard'
import WildCard from '@/app/components/WildCard'
import React, { useEffect, useState } from 'react'
import { useRecoilValue } from 'recoil'

const Page = () => {
  const [gameData, setgameData] = useState<any>()
  const socket = useRecoilValue(Socket)
  useEffect(() => {
    setgameData(JSON.parse(localStorage.getItem('gameData') || ''))

    socket && (socket.onmessage = (event) => {
      console.log(event.data);

      setgameData(JSON.parse(event.data))
    })
  }, [])
  return (
    gameData && <div className='flex h-screen overflow-hidden items-center flex-col p-12 justify-between relative'>
      {gameData.players.length > 1 ? <div className='flex h-full flex-col justify-center items-center gap-y-1.5'>
        <div className='flex'>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id !== gameData.id).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-ml-[4.5vw]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className='text-center font-medium text-lg mt-1.5'>{gameData.players.find((pl: any) => pl.id !== gameData.id).name}</p>
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
              return <WildCard type={card.type} isFirstCard={index === 0} />
          })}
        </div>
      </div>

      {/* <div className='flex absolute left-24 h-full flex-col justify-center items-center gap-y-1.5'>
      <div>
        <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
        <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
      </div>
      <p className='text-center font-medium text-lg'>Pushkar707</p>
    </div>

    <div className='flex absolute right-24 h-full flex-col justify-center items-center gap-y-1.5'>
      <div>
        <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
        <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
      </div>
      <p className='text-center font-medium text-lg'>Pushkar707</p>
    </div> */}
    </div>
  )
}

export default Page