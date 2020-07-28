import io from 'socket.io-client';
import { envUri } from './environment';
import { isServerUp } from './rest';

const mySocket = io(envUri + "/game-nsp");

const initiateGameSockets = isServerUp(() => {
    mySocket.on('connect', function () {
        return "intiated all socket"
    });
    mySocket.on('player-id', function (msg) { console.log(msg) });

})

const joinGame = (gameId) => {
    mySocket.emit("join-game-lobby", { gameId });
}



export {
    initiateGameSockets,
    joinGame, mySocket
}