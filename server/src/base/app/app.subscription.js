import { initializeGameNSP } from "../game/game.subscription.js"

export function initializeWebSocketNameSpaces(webSocketIo, sessionMiddleware) {

    initializeGameNSP(webSocketIo, sessionMiddleware);
    webSocketIo.on("connection", socket => {
        // generic io events 
    })
}