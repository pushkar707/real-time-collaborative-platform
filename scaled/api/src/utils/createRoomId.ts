import { redisClient } from "..";

export default async() => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = ''
    while (true) {
        for (let i = 0; i < 6; i++)
            id += characters[Math.floor(Math.random() * characters.length)]
        if (!await redisClient.hExists('rooms',id))
            break
        id = ''
    }
    return id
}