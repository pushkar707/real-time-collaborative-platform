'use client'
import React, { useEffect, useState } from 'react'

const Page = () => {
  const [gameData, setgameData] = useState()
  useEffect(() => {
    setgameData(JSON.parse(localStorage.getItem('gameData') || ''))
    
  },[])
  return (
    <div>

    </div>
  )
}

export default Page