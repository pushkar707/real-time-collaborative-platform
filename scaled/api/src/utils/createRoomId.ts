import { rooms } from "..";

export default () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = ''
    while (true) {
        for (let i = 0; i < 6; i++)
            id += characters[Math.floor(Math.random() * characters.length)]
        if (!rooms.has(id))
            break
        id = ''
    }
    return id
}