"use client"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const [socket, setsocket] = useState<WebSocket>()
  const router = useRouter()

  useEffect(() => {
    const socket = new WebSocket('ws://localhost:3000')
    socket.onopen = () => {
      setsocket(socket)
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log(data);
      if (data['roomId']) {
        console.log("Room id found");
        // localStorage.setItem('gameData', data)
        // router.push('/game/'+data['roomId'])
      }
    }
  }, [])

  const [name, setName] = useState('')
  const [roomId, setRoomId] = useState('')

  const createRoom = () => {
    socket?.send(JSON.stringify({ type: 'create-room', name: 'Pushkar-dev' }))
  }

  const joinRoom = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    socket?.send(JSON.stringify({ type: 'join-room', roomId, name }))
  }

  if (!socket)
    return 'Loading'
  return (
    <main className="flex justify-center flex-col items-center gap-7 min-h-screen">
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
      <button className="border px-2.5 py-1.5 border-black" onClick={createRoom}>Create Room</button>
    </main>
  );
}
