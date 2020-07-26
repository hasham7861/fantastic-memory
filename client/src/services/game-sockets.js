import io from 'socket.io-client';
import { envUri } from './environment';
import { isServerUp } from './rest';

const mySocket = io(envUri + "/game-nsp");

const initiateGameSockets = isServerUp(() => {
    mySocket.on('connect', function () {
        return "intiated all socket"
    });
    mySocket.on('player-id', function (msg) { console.log(msg)});
   
})

const getListOfAllPlayers = async (gameId) => {
    
    mySocket.emit("find-players-list",gameId);

    let players = []
    mySocket.on("players-list", function(listOfPlayers){
        players = [...listOfPlayers]
    })
    console.log(players)
    
   
}


const createGame = (gameId) => {
    mySocket.emit("initiate-game-lobby", { gameId });
}

export {
    initiateGameSockets,
    getListOfAllPlayers,
    createGame, mySocket
}