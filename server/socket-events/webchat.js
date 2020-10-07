// TODO store all gamesdata into data store like mongo, and for faster access store the data into memache service
// const { connectToDB } = require('./db');

const words = require("../database/category_of_words.json").words
const Game = require("../models/Game");
const Player = require("../models/Player");


// stores context of all games
global.currentGamesMap = {
    // '096ef6e3': new Game(...)
}

// map which allows server to query for which game a player is currently in
const userToGameMap = {
    //userId:gameId
}

function findHostOfGame(gameId) {
    if (gameId && gameId in currentGamesMap) {
        return currentGamesMap[gameId].hostId;
    } else {
        return null;
    }
}

function findCurrentPlayerTurn(gameId) {
    if (gameId && gameId in currentGamesMap) {
        return currentGamesMap[gameId].playerTurnId;
    } else {
        return null;
    }
}


function generateWord() {
    let randomNumIndex = Math.floor(Math.random() * words.length - 1)
    return words[randomNumIndex]
}

function intializeWSEvents() {

    let io = global.io;

    let gameNSP = io.of('/game-nsp');
    gameNSP.on("connection", socket => {

        let currentPlayerId = socket.id;

        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("player-id", currentPlayerId);


        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("player-id", currentPlayerId);
        })

        socket.on("update-host-id", gameId => {
            if (gameId in currentGamesMap && currentGamesMap[gameId].players && !currentGamesMap[gameId].players[currentPlayerId]) {
                currentGamesMap[gameId].players[currentPlayerId] = new Player(currentPlayerId, true);
                currentGamesMap[gameId].hostId = currentPlayerId;
                currentGamesMap[gameId].playerTurnId = currentPlayerId;
                userToGameMap[currentPlayerId] = gameId;
            }
           
        })
        // Host uses this event to intiate a namespace
        socket.on("join-game-lobby", ({ gameId, playerIndexStart }) => {

            // there isn't a game already with this gameId
            if (!currentGamesMap.hasOwnProperty(gameId)) {
                // hostId is the same as the currentPlayer who intiated the game
                currentGamesMap[gameId] = new Game(gameId,
                    players = {
                        [currentPlayerId]: new Player(currentPlayerId)
                    },
                    "MENU",
                    currentPlayerId,
                    currentPlayerId
                );

                userToGameMap[currentPlayerId] = gameId;
            }
            // currentPlayerId is not in game then add them to gameContext
            else if (!(currentGamesMap[gameId].players.hasOwnProperty(currentPlayerId))) {
                // only add the person with same socket once
                if (!(socket.id in currentGamesMap[gameId]) && currentGamesMap[gameId].players) {
                    currentGamesMap[gameId].players[currentPlayerId] = new Player(currentPlayerId);
                }
            }

            // update list of players for client
            let hostPlayerId = findHostOfGame(gameId);
            gameNSP.to(hostPlayerId).emit("players-list", currentGamesMap[gameId].players)

        })


        // return list of players within the same game
        socket.on("find-players-list", gameId => {

            if (!(currentGamesMap.hasOwnProperty(gameId))) {
                return
            }
          
            let listOfPlayers = gameId in currentGamesMap ? currentGamesMap[gameId].players : {}

            // delete players from context of game when they closed out of game
            for (let playerSocId in listOfPlayers) {
                if (!listOfPlayers[playerSocId].inGame)
                    delete listOfPlayers[playerSocId]
            }

            currentGamesMap[gameId].players = listOfPlayers;

            gameNSP.to(currentPlayerId).emit("players-list", listOfPlayers)

        })


        // share drawing with all the users within the same game
        socket.on("share-drawing-with-players", ({ gameId, playerId, canvasData }) => {
    
            // share drawing with other players in lobby
            let playersInGame = currentGamesMap[gameId].players
           
            for (let pId in playersInGame) {
                if (pId != playerId) {
                    gameNSP.to(pId).emit("draw-on-canvas", canvasData)
                }
            }

        })

        // TODO either remove this or put into seperate game logic part
        socket.on("do-i-get-a-word", (gameId) => {
            let playerId = findCurrentPlayerTurn(gameId);
            gameNSP.to(playerId).emit("get-drawing-word", generateWord());
        })


        // TODO remove this from here and have the game obj handle this event on its own
        // omit flag to client if their canvas should be enabled or not
        socket.on("enable-drawing-canvas", (gameId) => {

            if (gameId in currentGamesMap){
                // only enable canvas for players, whose turn it is
                if (gameId in currentGamesMap && currentGamesMap[gameId].players &&
                    currentPlayerId in currentGamesMap[gameId].players) {
                    if (currentPlayerId == currentGamesMap[gameId].playerTurnId) {
                        // emit event to player whose canvas isn't disabled
                        gameNSP.to(currentPlayerId).emit("toggle-drawing-canvas", canvasDisabled = false)
                    } else {
                        // emit event to player whose canvas isn disabled
                        gameNSP.to(currentPlayerId).emit("toggle-drawing-canvas", canvasDisabled = true)
                    }
                }
            }

        })

        // TODO this logic is to be moved to seperate game server
        socket.on("game-started", gameId => {
            // TODO emit game start event to all clients

            for (let playerId in currentGamesMap[gameId].players) {
                let player = currentGamesMap[gameId].players[playerId];
                if (player.inGame && player.id != currentGamesMap[gameId].hostId) {
                    gameNSP.to(player.id).emit("start-game", { gameId, playerId: player.id })
                }
            }

        })

        // TODO set score of player based on drawing, increase score of player based on the correct guess word
        socket.on("check-guessed-word", ({gameId, guessedWord})=>{

        })
      
       

        socket.on("close-game", gameId => {

            if (gameId in currentGamesMap && currentGamesMap[gameId].players) {
                // delete tracking of which game player is in currently
                for (let player in currentGamesMap[gameId].players) {
                    delete userToGameMap[player.id]
                }
                // delete the entire
                delete currentGamesMap[gameId]
            }

        })

        // clean up game map once user leaves, if host leaves then delete the entire gameid
        socket.on("disconnect", msg => {

            if (currentPlayerId in userToGameMap) {
                let gameId = userToGameMap[currentPlayerId];
                let player = currentGamesMap[gameId].players[currentPlayerId];
                if (player) {
                    player.inGame = false;
                    delete userToGameMap[currentPlayerId];
                    delete currentGamesMap[gameId].players[currentPlayerId];
                }
            }
        })

    })

    io.on("connection", socket => {
        // generaic io events 
    })
   
    global.gameNSP = gameNSP;
}



module.exports = {
    currentGamesMap,
    intializeWSEvents,
    findCurrentPlayerTurn
}