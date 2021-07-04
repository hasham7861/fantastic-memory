import io from 'socket.io-client'
import conf from './config.dev'
import GameApiClient from './GameApiClient'

export const mySocket = io(conf.GAME_API_BASE_URL + "/game-nsp")

export const initiateGameSockets = GameApiClient.isServerUp(() => {
    mySocket.on('connect', function () {
        return "intiated all socket"
    })

    // mySocket.on('disconnect', function (){
    //     mySocket.emit("disconnect",{msg:"close connection"})
    // })
    mySocket.on('player-id', function (msg) { console.log(msg) })

})

export const joinGame = (gameId, playerIndexStart) => {
    mySocket.emit("join-game-lobby", { gameId, playerIndexStart })
}

export const closeGame = (gameId) => {
    mySocket.emit("close-game", gameId)
}

export const checkIsMyTurn = (isMyTurnStateChangeCB) =>{
    mySocket.on("is-my-turn", isMyTurn => {
        isMyTurnStateChangeCB(isMyTurn)
    })
}
