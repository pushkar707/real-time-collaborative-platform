"use client"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useRecoilState, useSetRecoilState } from "recoil"
import Socket from "./atoms/socket"
import gameDataAtom from "./atoms/gameDataAtom"

export default function Home() {
  const [socket, setsocket] = useRecoilState(Socket)
  const setGameData = useSetRecoilState(gameDataAtom)
  const [showCreateRoomPopup, setshowCreateRoomPopup] = useState(false)
  const [roomCreatorName, setRoomCreatorName] = useState('')
  const router = useRouter()

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000')
    socket.onopen = () => {
      setsocket(socket)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data);

      if (data.type === 'error')
        window.alert(data.message)
      
      if (data['roomId']) {
        setGameData(data)
        router.push('/game/' + data['roomId'])
      }
    }
  }, [])

  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')

  const createRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    socket?.send(JSON.stringify({ type: 'create-room', name: roomCreatorName }))
  }

  const joinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    socket?.send(JSON.stringify({ type: 'join-room', roomId, name }))
  }

  if (!socket)
    return 'Loading'
  return (
    <main className="flex justify-center flex-col items-center gap-7 min-h-screen">
      {showCreateRoomPopup ? <div className='absolute w-screen h-screen top-0 left-0 z-10 bg-gray-200 bg-opacity-90 flex justify-center items-center'>
        <form onSubmit={createRoom} className='bg-white px-8 py-6 rounded-md shadow relative pt-9'>
          <span className="absolute top-1 right-2 text-lg font-medium cursor-pointer" onClick={() => setshowCreateRoomPopup(false)}>X</span>
          <input type="text" placeholder="Enter your name" value={roomCreatorName} onChange={e => setRoomCreatorName(e.target.value)} className="px-3 py-2 border border-black" />
          <button className="bg-black px-3 py-2 text-white block mt-4">Create</button>
        </form>
      </div> : ''}
      <form className="bg-slate-800 text-slate-100 p-5 flex flex-col gap-6 max-w-xl" onSubmit={joinRoom}>
        <div className="flex flex-col gap-4">
          <p className="font-semibold text-xl text-center">Play Uno with friends</p>
          <p className="text-sm ">To get started, enter your player name and a game room. Other players can join your game with the same room name on their device.</p>
        </div>
        <div className="flex flex-col gap-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="col-span-3 text-sm bg-slate-800 border border-slate-300 px-3 py-2" placeholder="Name" />
          <input type="text" required value={roomId} onChange={(e) => setRoomId(e.target.value)} className="col-span-3 text-sm bg-slate-800 border border-slate-300 px-3 py-2" placeholder="Room id" />
          <button className="w-fit mx-auto px-4 py-2 bg-black">Join Room</button>
        </div>
      </form>
      <button className="border px-2.5 py-1.5 border-black" onClick={() => setshowCreateRoomPopup(true)}>Create Room</button>
    </main>
  );
}
