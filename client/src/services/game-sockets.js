import io from 'socket.io-client';
import { envUri } from './environment';
import { isServerUp } from './rest';

const mySocket = io(envUri + "/game-nsp");

const initiateGameSockets = isServerUp(() => {
    mySocket.on('connect', function () {
        return "intiated all socket"
    });
    mySocket.on('game-id', function (msg) { console.log(msg)});
   
})

const getListOfAllPlayers = async (gameId) => {
    mySocket.emit("players-in-game",gameId,(listOfPlayers)=>{
        console.log(listOfPlayers);
        return listOfPlayers
    });

}

const createGame = (gameId) => {
    console.log('got there')
    mySocket.emit("initiate-game-lobby", { gameId });
}

export {
    initiateGameSockets,
    getListOfAllPlayers,
    createGame
}