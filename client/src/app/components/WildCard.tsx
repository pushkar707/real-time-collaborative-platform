import React from 'react'

const WildCard = ({ type, isFirstCard }: { type: 'wild' | 'draw-four', isFirstCard: boolean }) => {
    return (
        <div className={`w-[8vw] text-white h-[20vh] outline-slate-800 outline-1 outline ${!isFirstCard && '-ml-[4.5vw]'} rounded-xl relative`}>
            <img src={type === 'wild' ? '/wild.jpeg' : '/draw-four.png'} className='w-full max-h-full' />
        </div>
    )
}

export default WildCard