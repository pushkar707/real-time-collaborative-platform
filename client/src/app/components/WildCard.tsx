import React from 'react'

const WildCard = ({ type }: { type: 'wild' | 'draw-four'}) => {
    return (
        <div className={`w-full h-full rounded-xl relative flex justify-center items-center`}>
            <img src={type === 'wild' ? '/wild.jpeg' : '/draw-four.png'} className='w-full max-h-full' />
        </div>
    )
}

export default WildCard