'use client'
import gameDataAtom from '@/app/atoms/gameDataAtom'
import Socket from '@/app/atoms/socket'
import Card from '@/app/components/Card'
import PlayerCards from '@/app/components/PlayerCards'
import { connectSocket } from '@/app/utils'
import { useRouter, useParams } from 'next/navigation'
import React, { FormEvent, useEffect, useState } from 'react'
import { useRecoilState } from 'recoil'

const Page = () => {
  // add a check where activeUser is allowed to move only when they receive a response
  const [gameData, setgameData] = useRecoilState(gameDataAtom)
  const [socket, setSocket] = useRecoilState(Socket)
  const [left, setLeft] = useState<number>(0)
  const [top, setTop] = useState<number>(0)
  const [right, setRight] = useState<number>(0)
  const [showJoinRoomPopup, setshowJoinRoomPopup] = useState(socket ? false : true)
  const [roomJoineeName, setRoomJoineeName] = useState('')

  const router = useRouter()
  const params = useParams()

  const joinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { roomId } = params
    if (!socket) {
      connectSocket(setSocket, setgameData, router, JSON.stringify({ type: 'join-room', roomId, name: roomJoineeName }))
      setshowJoinRoomPopup(false)
    }
  }

  useEffect(() => {
    const eventListener = (e: BeforeUnloadEvent) => {
      e.returnValue = 'You will be exited from the game if you leave';
    }
    window.addEventListener('beforeunload', eventListener)

    return () => {
      window.removeEventListener('beforeunload', eventListener)
    }
  }, [])

  useEffect(() => {
    if (!gameData)
      return

    if (gameData.isAnnouncement) {
      window.alert(gameData.message)
      if(gameData.gameOver){
        localStorage.removeItem('roomId')
        localStorage.removeItem('playerId')
        router.push('/')
      }
      if (gameData.playerLeft) {
        setTop(0)
        setLeft(0)
        setRight(0)
      }
    }

    if (!gameData.hasGameStarted || gameData.playerLeft) {
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
  }, [gameData])

  const startGame = () => {
    if (gameData.players.length <= 1)
      return alert('You need 2 to 4 players to start')

    socket?.send(JSON.stringify({ type: 'start-game' }))
  }

  const drawOneCard = () => {
    // pending: make sure user doesn't draw the card twice
    if (!gameData.lastCard)
      return

    if (gameData.cardDrawn)
      return alert('You can only draw one card in a turn')
    socket?.send(JSON.stringify({ type: 'move', move: 'draw-card' }))
  }

  return (
    showJoinRoomPopup ? <div className='absolute w-screen h-screen top-0 left-0 z-10 bg-gray-200 bg-opacity-90 flex justify-center items-center'>
      <form onSubmit={joinRoom} className='bg-white px-8 py-6 rounded-md shadow relative pt-9'>
        <span className="absolute top-1 right-2 text-lg font-medium cursor-pointer" onClick={() => setshowJoinRoomPopup(false)}>X</span>
        <input type="text" required placeholder="Enter your name" value={roomJoineeName} onChange={e => setRoomJoineeName(e.target.value)} className="px-3 py-2 border border-black" />
        <button className="bg-black px-3 py-2 text-white block mt-4">Join</button>
      </form>
    </div> :
      (gameData && <div className='flex h-[90vh] md:h-screen items-center flex-col p-6 justify-between relative'>
        {top ? <PlayerCards positionId={top} orientation={'horizontal'} /> : <div></div>}

        <div className='flex items-center gap-2'>
          <img className='w-16 h-24 md:w-24 md:h-36 xl:w-32 xl:h-44 rounded-xl' src="/card.png" alt="" onClick={drawOneCard} />
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
              return <Card key={index} card={card} index={index} />
            })}
          </div>
        </div>

        {left ? <PlayerCards positionId={left} orientation={'vertical'} classes='absolute left-4 md:left-12 xl:left-24 h-[90%]' /> : ''}
        {right ? <PlayerCards positionId={right} orientation={'vertical'} classes='absolute right-4 md:right-12 xl:right-24 h-[90%]' /> : ''}
      </div>)
  )
}

export default Page