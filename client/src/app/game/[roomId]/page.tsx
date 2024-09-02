'use client'
import gameDataAtom from '@/app/atoms/gameDataAtom'
import Socket from '@/app/atoms/socket'
import ActionCard from '@/app/components/ActionCard'
import Card from '@/app/components/Card'
import NumberCard from '@/app/components/NumberCard'
import WildCard from '@/app/components/WildCard'
import { root } from 'postcss'
import React, { act, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

const Page = () => {
  const [gameData, setgameData] = useRecoilState(gameDataAtom)
  const socket = useRecoilValue(Socket)
  const [left, setLeft] = useState<number>(0)
  const [top, setTop] = useState<number>(0)
  const [right, setRight] = useState<number>(0)

  useEffect(() => {
    socket && (socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data);

      data.type === 'new' ? setgameData(data) : data.type === 'append' ? setgameData((prev: any) => {
        return { ...prev, ...data }
      }) : ''
    })

    window.addEventListener('beforeunload', (e) => {
      e.returnValue = 'You will be exited from the game if you leave';
    })
  }, [])

  useEffect(() => {
    if (!gameData)
      return
    const activePlayerId = gameData.id
    const length = gameData.players.length
    if (length === 2)
      setTop(activePlayerId === 1 ? 2 : 1)
    else if (length === 3) {
      setLeft(activePlayerId + 1 <= length ? activePlayerId + 1 : 1)
      setTop(activePlayerId + 2 <= length ? activePlayerId + 2 : activePlayerId - 1)
    }
    else if (length === 4) {
      setLeft(activePlayerId + 1 <= length ? activePlayerId + 1 : 1)
      setTop(activePlayerId + 2 <= length ? activePlayerId + 2 : activePlayerId - 2)
      setRight(0 < activePlayerId - 1 ? activePlayerId - 1 : length)
    }

    console.log(gameData);

  }, [gameData])

  const startGame = () => {
    if (gameData.players.length <= 1)
      return alert('You need 2 to 4 players to start')

    socket?.send(JSON.stringify({ type: 'start-game', roomId: gameData.roomId }))
  }

  const drawOneCard = () => {
    if (!gameData.lastCard)
      return

    socket?.send(JSON.stringify({ type: 'move', roomId: gameData.roomId, move: 'draw-card' }))
  }

  return (
    gameData && <div className='flex h-screen items-center flex-col p-12 justify-between relative'>
      {top ? <div className='flex flex-col justify-center items-center gap-y-1.5'>
        <div className='flex'>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id === top).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-ml-[4.5vw]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className={`text-center font-medium text-lg mt-1.5 ${gameData.lastTurn === top && 'font-semibold underline'}`}>{gameData.players.find((pl: any) => pl.id === top).name}</p>
      </div> : <div></div>}

      <div className='flex items-center gap-2'>
        <img className='w-[8vw] h-[22vh] rounded-xl' src="/card.png" alt="" onClick={drawOneCard} />
        {gameData.lastCard ? <Card card={gameData.lastCard} index={0} isCenterCard={true} /> : ''}
      </div>

      <div>
        <p className={`text-center font-medium text-lg mb-2 ${gameData.lastTurn === gameData.id && 'font-semibold underline'}`}>
          {gameData.name}
          {(!gameData.lastTurn && (gameData.id === 1)) ? <button onClick={startGame} className='px-2 py-1 bg-blue-500 text-white ml-3 rounded'>Start game</button> : ''}
        </p>
        <div className='flex'>
          {gameData.cards.map((card: any, index: number) => {
            return <Card card={card} index={index} />
          })}
        </div>
      </div>

      {left ? <div className='flex absolute left-24 h-[90%] flex-col justify-center items-center gap-y-1.5'>
        <div>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id === left).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-mt-[17vh]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className={`text-center font-medium text-lg ${gameData.lastTurn === left && 'font-semibold underline'}`}>{gameData.players.find((pl: any) => pl.id === left).name}</p>
      </div> : ''}

      {right ? <div className='flex absolute right-24 h-[90%] flex-col justify-center items-center gap-y-1.5'>
        <div>
          {Array.from({ length: gameData.players.find((pl: any) => pl.id === right).cardsRemaining }).map((_, index) => {
            return <img className={`w-[8vw] h-[22vh] rounded-xl ${index !== 0 && '-mt-[17vh]'}`} src="/card.png" alt="" />
          })}
        </div>
        <p className={`text-center font-medium text-lg ${gameData.lastTurn === right && 'font-semibold underline'}`}>{gameData.players.find((pl: any) => pl.id === right).name}</p>
      </div> : ''}
    </div>
  )
}

export default Page