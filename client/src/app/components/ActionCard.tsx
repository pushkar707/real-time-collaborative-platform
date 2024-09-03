import React, { act } from 'react'

const ActionCard = ({ color, action }: { color: string, action: 'skip' | 'reverse' | 'draw-two' }) => {
    return (
        <div className={`w-full h-full rounded-xl relative flex justify-center items-center bg-${color}-500`}>
            <span className='absolute left-0 top-0 text-sm md:text-lg xl:text-2xl'>{action === 'draw-two' ? '+2' : action === 'reverse' ? <img src='/reverse.png' className='xl:w-[18px] xl:h-[18px] md:w-[14px] md:h-[14px] w-[10px] h-[10px] m-1' /> : action === 'skip' ? <img src='/skip.png' className='invert xl:w-[18px] xl:h-[18px] md:w-[14px] md:h-[14px] w-[10px] h-[10px] m-1' /> : ''}</span>
            <div className='bg-white text-5xl rotate-45 w-[72%] h-[48%] justify-center items-center'>
                <div className='-rotate-45 relative'>
                    {action === 'draw-two' ? <>
                        <div className={`bg-${color}-500 w-[30px] h-[40px] hidden lg:block border-2 border-white absolute -top-2 right-11`}></div>
                        <div className={`bg-${color}-500 w-[30px] h-[40px] hidden lg:block border-2 border-white absolute top-4 right-14`}></div>
                    </> : action === 'reverse' ? <img src='/reverse.png' className='w-[70%] h-[125%] mt-[10%] ml-[7%]' /> :
                        action === 'skip' ? <img src='/skip.png' className='w-[70%] h-[125%] mt-[10%] ml-[7%]' /> : ''}
                </div>
            </div>
            <span className='absolute right-0 bottom-0 text-2xl'>{action === 'draw-two' ? '+2' : action === 'reverse' ? <img src='/reverse.png' className='xl:w-[18px] xl:h-[18px] md:w-[14px] md:h-[14px] w-[10px] h-[10px] m-1' /> : action === 'skip' ? <img src='/skip.png' className='invert xl:w-[18px] xl:h-[18px] md:w-[14px] md:h-[14px] w-[10px] h-[10px] m-1' /> : ''}</span>
            <span className='hidden bg-green-500 bg-red-500 bg-yellow-500 bg-blue-500 text-green-500 text-red-500 text-yellow-500 text-blue-500'></span>
        </div>
    )
}

export default ActionCard