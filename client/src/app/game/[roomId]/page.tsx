'use client'
import ActionCard from '@/app/components/ActionCard'
import NumberCard from '@/app/components/NumberCard'
import WildCard from '@/app/components/WildCard'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [gameData, setgameData] = useState()
  useEffect(() => {
    setgameData(JSON.parse(localStorage.getItem('gameData') || ''))

  }, [])
  return (
    <div className='flex h-screen overflow-hidden items-center flex-col p-12 justify-between relative'>
      <div>
        <div className='flex'>
          <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -ml-[6vw]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -ml-[6vw]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -ml-[6vw]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -ml-[6vw]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -ml-[6vw]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -ml-[6vw]' src="/card.png" alt="" />
        </div>
        <p className='text-center font-medium text-lg mt-1.5'>Deepak</p>
      </div>
      <div className='flex'>
        <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
      </div>
      <div>
        <p className='text-center font-medium text-lg mb-1.5'>Pushkar-dev</p>
        <div className='flex'>
          <NumberCard color='green' number='6' isFirstCard={true} />
          <WildCard type='wild' isFirstCard={false} />
          <ActionCard color='blue' action='skip' isFirstCard={false} />
          <ActionCard color='green' action='reverse' isFirstCard={false} />
          <NumberCard color='red' number='4' isFirstCard={false} />
          <ActionCard color='blue' action='draw-two' isFirstCard={false} />
          <WildCard type='draw-four' isFirstCard={false} />
        </div>
      </div>

      <div className='flex absolute left-24 h-full flex-col justify-center items-center gap-y-1.5'>
        <div>
          <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
        </div>
        <p className='text-center font-medium text-lg'>Pushkar707</p>
      </div>

      <div className='flex absolute right-24 h-full flex-col justify-center items-center gap-y-1.5'>
        <div>
          <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
          <img className='w-[8vw] h-[22vh] rounded-xl -mt-[17vh]' src="/card.png" alt="" />
        </div>
        <p className='text-center font-medium text-lg'>Pushkar707</p>
      </div>
    </div>
  )
}

export default Page