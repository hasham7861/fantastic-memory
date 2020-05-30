import io from 'socket.io-client';
import { envUri } from './environment';
import { isServerUp } from './rest';

const mySocket = io(envUri);

const initiateGameSockets = isServerUp(() => {
    mySocket.on('connect', function () {
        console.log("connected")
        return "intiated all socket"
     });
    // mySocket.on('initiate-game-lobby', function (data) { });
    mySocket.on('disconnect', function () { });
   
})

// const getListOfAllGuestFromGame = (gameId) => {
//     // mySocket.io
// }

const createGame = (gameId) => {
    console.log('got there')
    // mySocket.emit("initiate-game-lobby", gameId,
    //     data => {
    //         console.log(data)
    //     });
}

export {
    initiateGameSockets,
    // getMySockId,
    createGame
}