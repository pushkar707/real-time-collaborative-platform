import { atom } from "recoil";

export default atom<WebSocket|null>({
    key: 'socketState',
    default: null
})