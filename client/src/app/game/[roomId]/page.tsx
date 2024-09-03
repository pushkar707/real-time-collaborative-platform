'use client'
import gameDataAtom from '@/app/atoms/gameDataAtom'
import Socket from '@/app/atoms/socket'
import ActionCard from '@/app/components/ActionCard'
import Card from '@/app/components/Card'
import CardBackImg from '@/app/components/CardBackImg'
import NumberCard from '@/app/components/NumberCard'
import PlayerCards from '@/app/components/PlayerCards'
import WildCard from '@/app/components/WildCard'
import { useRouter } from 'next/navigation'
import { root } from 'postcss'
import React, { act, useEffect, useState } from 'react'
import { useRecoilState, useRecoilValue } from 'recoil'

const Page = () => {
  // add a check where activeUser is allowed to move only when they receive a response
  const [gameData, setgameData] = useRecoilState(gameDataAtom)
  const socket = useRecoilValue(Socket)
  const [left, setLeft] = useState<number>(0)
  const [top, setTop] = useState<number>(0)
  const [right, setRight] = useState<number>(0)

  useEffect(() => {
    window.addEventListener('beforeunload', (e) => {
      e.returnValue = 'You will be exited from the game if you leave';
    })

    socket && (socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data);

      data.type === 'new' ? setgameData(data) : data.type === 'append' ? setgameData((prev: any) => {
        return { ...prev, ...data }
      }) : (data.type === 'error') ? window.alert(data.message) : ''
    })

  }, [])

  const router = useRouter()
  useEffect(() => {
    if (!gameData)
      return

    if (gameData.isAnnouncement) {
      window.alert(gameData.message)
      router.push('/')
    }

    if (!gameData.hasGameStarted) {
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
    }

    console.log(gameData);
  }, [gameData])

  const startGame = () => {
    if (gameData.players.length <= 1)
      return alert('You need 2 to 4 players to start')

    socket?.send(JSON.stringify({ type: 'start-game', roomId: gameData.roomId }))
  }

  const drawOneCard = () => {
    // pending: make sure user doesn't draw the card twice
    if (!gameData.lastCard)
      return

    if (gameData.cardDrawn)
      return alert('You can only draw one card in a turn')
    socket?.send(JSON.stringify({ type: 'move', roomId: gameData.roomId, move: 'draw-card' }))
  }

  return (
    gameData && <div className='flex h-screen items-center flex-col p-6 justify-between relative'>
      {top ? <PlayerCards positionId={top} orientation={'horizontal'} /> : <div></div>}

      <div className='flex items-center gap-2'>
        <img className='w-32 h-44 rounded-xl' src="/card.png" alt="" onClick={drawOneCard} />
        {gameData.lastCard ? <Card card={gameData.lastCard} index={0} isCenterCard={true} /> : ''}
        {gameData.lastCard ? <div className={`bg-${gameData.lastCard?.color}-500 w-10 h-10 ml-1`}></div> : ''}
      </div>

      <div>
        <p className={`text-center font-medium text-lg mb-2 ${gameData.nextTurn === gameData.id && 'font-semibold underline'}`}>
          {gameData.name}
          {(!gameData.nextTurn && (gameData.id === 1)) ? <button onClick={startGame} className='px-2 py-1 bg-blue-500 text-white ml-3 rounded'>Start game</button> : ''}
        </p>
        <div className='flex'>
          {gameData.cards.map((card: any, index: number) => {
            return <Card card={card} index={index} />
          })}
        </div>
      </div>

      {left ? <PlayerCards positionId={left} orientation={'vertical'} classes='absolute left-24 h-[90%]' /> : ''}
      {right ? <PlayerCards positionId={right} orientation={'vertical'} classes='absolute right-24 h-[90%]' /> : ''}
    </div>
  )
}

export default Page