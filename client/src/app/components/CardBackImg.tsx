import React from 'react'

const CardBackImg = ({ orientation, isFirstImg }: { orientation: 'horizontal' | 'vertical', isFirstImg:boolean }) => {
    return (
        <img className={`w-32 h-44 rounded-xl ${!isFirstImg && (orientation === 'horizontal' ? '-ml-20' : '-mt-36')}`} src="/card.png" alt="" />
    )
}

export default CardBackImg