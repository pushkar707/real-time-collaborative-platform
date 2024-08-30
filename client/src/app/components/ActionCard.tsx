import React, { act } from 'react'

const ActionCard = ({ color, action, isFirstCard }: { color: string, action: 'skip' | 'reverse' | 'draw-two', isFirstCard: boolean }) => {
    return (
        <div className={`w-[8vw] text-white h-[20vh] border-white border-4 outline-slate-800 outline-1 outline ${!isFirstCard && '-ml-[4.5vw]'} rounded-xl relative flex justify-center items-center border-box bg-${color}-500`}>
            <span className='absolute left-0 top-0 text-2xl'>{action === 'draw-two' ? '+2' : action === 'reverse' ? <img src='/reverse.png' className='w-[18px] h-[18px] m-1'/> : action === 'skip' ? <img src='/skip.png' className='invert w-[18px] h-[18px] m-1'/> : ''}</span>
            <div className='bg-white text-5xl rotate-45 w-[80px] h-[80px] justify-center items-center'>
                <div className='-rotate-45 relative'>
                    {action === 'draw-two' ? <>
                        <div className={`bg-${color}-500 w-[30px] h-[40px] border-2 border-white absolute top-0 right-11`}></div>
                        <div className={`bg-${color}-500 w-[30px] h-[40px] border-2 border-white absolute top-6 right-14`}></div>
                    </> : action === 'reverse' ? <img src='/reverse.png' className='w-[50px] h-[50px] mt-3 ml-3.5'/> :
                        action === 'skip' ? <img src='/skip.png' className='w-[50px] h-[50px] mt-3 ml-3.5' /> : ''}
                </div>
            </div>
            <span className='absolute right-0 bottom-0 text-2xl'>{action === 'draw-two' ? '+2' : action === 'reverse' ? <img src='/reverse.png' className='w-[18px] h-[18px] m-1'/> : action === 'skip' ? <img src='/skip.png' className='invert w-[18px] h-[18px] m-1'/> : ''}</span>
            <span className='hidden bg-green-500 bg-red-500 bg-yellow-500 bg-blue-500 text-green-500 text-red-500 text-yellow-500 text-blue-500'></span>
        </div>
    )
}

export default ActionCard