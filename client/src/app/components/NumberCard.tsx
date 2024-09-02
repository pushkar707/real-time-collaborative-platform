import { space } from 'postcss/lib/list'
import React from 'react'

const ColorNumberCard = ({color, number, isFirstCard}:{color:string, number: string, isFirstCard: boolean}) => {
  return (
    <div className={`w-[8vw] text-white h-[20vh] border-white border-4 outline-slate-800 outline-1 outline ${!isFirstCard && '-ml-[4.5vw]'} rounded-xl relative flex justify-center items-center border-box bg-${color}-500`}>
        <span className='absolute left-0.5 top-0 text-2xl'>{number}</span>
        <div className='bg-white text-5xl rotate-45 w-[80px] h-[80px] justify-center items-center'>
            <div className='-rotate-45'>
                <p className={`text-8xl text-${color}-500 w-fit ml-2.5 -mt-2 scale-[0.83] font-semibold`}>{number}</p>
                {number == '6' ? <div className={`bg-${color}-500 h-1 w-10 -mt-5 ml-3.5`}></div> : ''}

            </div>
        </div>
        <span className='absolute right-0.5 bottom-0 text-2xl'>{number}</span>
        <span className='hidden bg-green-500 bg-red-500 bg-yellow-500 bg-blue-500 text-green-500 text-red-500 text-yellow-500 text-blue-500'></span>
    </div>
  )
}

export default ColorNumberCard