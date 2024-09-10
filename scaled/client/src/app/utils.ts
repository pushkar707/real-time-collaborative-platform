export const connectSocket = (setsocket: Function, setGameData: Function, router: any, initialMessage?: string) => {
    const socket = new WebSocket(process.env.NEXT_PUBLIC_API_URL || '')
    socket.onopen = () => {
        setsocket(socket)
        if (initialMessage)
            return socket.send(initialMessage)
        const prevRoomId = localStorage.getItem('roomId')
        const prevPlayerId = localStorage.getItem('playerId')
        if (prevRoomId && prevPlayerId)
            socket.send(JSON.stringify({ type: 'reconnect', prevRoomId, prevPlayerId }))
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log(data);

        data.type === 'new' ? setGameData(data) : data.type === 'append' ? setGameData((prev: any) => {
            return { ...prev, ...data }
        }) : (data.type === 'error') ? window.alert(data.message) : ''

        if (data['roomId']) {
            router.push('/game/' + data['roomId'])
            localStorage.setItem('roomId', data['roomId'])
        }
        if (data['roomId'])
            localStorage.setItem('playerId', data['id'])
    }

    socket.onclose = () => {
        connectSocket(setsocket, setGameData, router)
    }
}