import React from 'react'

const CardBackImg = ({ orientation, isFirstImg }: { orientation: 'horizontal' | 'vertical', isFirstImg:boolean }) => {
    return (
        <img className={`w-14 h-20 md:w-24 md:h-36 xl:w-32 xl:h-44 rounded-xl ${!isFirstImg && (orientation === 'horizontal' ? '-ml-8 md:-ml-12 xl:-ml-20' : '-mt-14 md:-mt-28 xl:-mt-36')}`} src="/card.png" alt="" />
    )
}

export default CardBackImg