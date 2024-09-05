import { space } from 'postcss/lib/list'
import React from 'react'

const ColorNumberCard = ({ color, number }: { color: string, number: string }) => {
  return (
    <div className={`w-full h-full rounded-xl relative flex justify-center items-center bg-${color}-500`}>
      <span className='absolute left-0.5 top-0 text-sm md:text-lg xl:text-2xl'>{number}</span>
      <div className='bg-white  rotate-45 w-[72%] h-[48%] justify-center items-center'>
        <div className='-rotate-45'>
          <p className={`text-4xl md:text-6xl xl:text-8xl text-${color}-500 w-fit ml-[10%] -mt-[16%] scale-[0.83] font-semibold`}>{number}</p>
          {number == '6' ? <div className={`bg-${color}-500 h-1 w-10 -mt-5 ml-3.5`}></div> : ''}

        </div>
      </div>
      <span className='absolute right-0.5 bottom-0 text-sm md:text-lg xl:text-2xl'>{number}</span>
      <span className='hidden bg-green-500 bg-red-500 bg-yellow-500 bg-blue-500 text-green-500 text-red-500 text-yellow-500 text-blue-500'></span>
    </div>
  )
}

export default ColorNumberCard