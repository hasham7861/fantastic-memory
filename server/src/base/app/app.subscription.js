import { initializeGameNSP } from "../game/game.subscription.js"

export function initializeWebSocketNameSpaces(webSocketIo) {

    initializeGameNSP(webSocketIo);
    webSocketIo.on("connection", socket => {
        // generic io events 
    })
}