// TODO store all gamesdata into data store like mongo, and for faster access store the data into memache service
// const { connectToDB } = require('./db');
const words = require("./database/category_of_words.json").words
const Game = requrie("./models/Game");

// stores context of all games
const currentGamesMap = {
    // '096ef6e3': {
    //   '/game-nsp#xDyy_b7cqqQoqZeLAAAC': { status: 'active', host: true, player_turn: true },
    //   '/game-nsp#vIzy3GqOlps3GUqRAAAB': { status: 'closed', host: false, player_turn: false},
    //   '/game-nsp#mZOGYqfjFUcNhu1DAAAF': { status: 'active', host: false, player_turn: false }
    // }
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

// function findHostOfGame(gameId) {
//     for (let playerSocId in currentGamesMap[gameId]) {
//         if (currentGamesMap[gameId][playerSocId].host)
//             return playerSocId
//     }
// }

// function findCurrentPlayerTurn(gameId) {
//     for (let playerSocId in currentGamesMap[gameId]) {
//         if (currentGamesMap[gameId][playerSocId].player_turn)
//             return playerSocId
//     }
// }

function generateWord() {
    let randomNumIndex = Math.floor(Math.random() * words.length - 1)
    return words[randomNumIndex]
}


function intializeWSEvents(io) {


    let gameNSP = io.of('/game-nsp');
    gameNSP.on("connection", socket => {
        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("player-id", socket.id);

        let currentPlayerId = socket.id;

        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("player-id", socket.id);
        })

        socket.on("update-host-id", gameId => {
            if (gameId in currentGamesMap && currentPlayerId in currentGamesMap[gameId].players) {
                currentGamesMap[gameId].players[currentPlayerId] = new Player(currentPlayerId, true);
                currentGamesMap[gameId].hostId = currentPlayerId;
                currentGamesMap[gameId].playerTurnId = currentPlayerId;

                userToGameMap[socket.id] = gameId
            }
            // if (gameId in currentGamesMap && socket.id in currentGamesMap[gameId]) {
            //     currentGamesMap[gameId][socket.id] = { status: 'active', host: true, player_turn: true }
            //     userToGameMap[socket.id] = gameId
            // }
        })
        // Host uses this event to intiate a namespace
        socket.on("join-game-lobby", ({ gameId, playerIndexStart }) => {

            // there isn't a game already with this gameId
            if (!currentGamesMap.hasOwnProperty(gameId)) {
                // hostId is the same as the currentPlayer who intiated the game
                currentGamesMap[gameId] = new Game(gameId, hostId = currentPlayerId,
                    players = {
                        currentPlayerId = new Player(id = currentPlayerId)
                    },
                    playerTurnId = currentPlayerId
                );

                userToGameMap[currentPlayerId] = gameId;
            }
            // currentPlayerId is not in game then add them to gameContext
            else if (!(currentPlayerId in currentGamesMap[gameId])) {
                // only add the person with same socket once
                if (!(socket.id in currentGamesMap[gameId])) {
                    currentGamesMap[gameId].players.push(new Player(id = currentPlayerId));
                }
            }

            // update list of players for client
            let hostPlayerId = findHostOfGame(gameId);
            gameNSP(hostPlayerId).emit("players-list", currentGamesMap[gameId])

            // if (!currentGamesMap.hasOwnProperty(gameId)) {
            //     currentGamesMap[gameId] = { [socket.id]: { status: 'active', host: true, player_turn: true } }
            //     userToGameMap[socket.id] = gameId;
            // } else {
            //     // only add the person with same socket once
            //     let alreadyJoinedGame = socket.id in currentGamesMap[gameId]
            //     if (!alreadyJoinedGame) {
            //         currentGamesMap[gameId][socket.id] = { status: 'active', host: false, player_turn: false }
            //         userToGameMap[socket.id] = gameId;
            //     }
            // }

            // // setting turn of the right player
            // if (Object.keys(currentGamesMap[gameId])[playerIndexStart]) {
            //     Object.keys(currentGamesMap[gameId])[playerIndexStart].player_turn = true
            // }

            // // console.log(currentGamesMap);
            // let hostSocId = findHostOfGame(gameId)
            // // console.log(hostSocId)
            // gameNSP.to(hostSocId).emit("players-list", currentGamesMap[gameId])

        })


        // return list of players within the same game
        socket.on("find-players-list", gameId => {
            let listOfPlayers = gameId in currentGamesMap ? currentGamesMap[gameId].players : []
            // delete players from context of game when they closed out of game
            for (let playerSocId in listOfPlayers) {
                if (!listOfPlayers[playerSocId].inGame)
                    delete listOfPlayers[playerSocId]
            }

            gameNSP.to(currentPlayerId).emit("players-list", listOfPlayers)


            // let listOfPlayers = gameId in currentGamesMap ? currentGamesMap[gameId] : []
            // // filter listOfPlayers to return all players that are still in the game
            // for (let playerSocId in listOfPlayers) {
            //     if (listOfPlayers[playerSocId].status == "closed")
            //         delete listOfPlayers[playerSocId]
            // }
            // gameNSP.to(socket.id).emit("players-list", listOfPlayers);
        })


        // share drawing with all the users within the same game
        socket.on("share-drawing-with-players", ({ gameId, playerId, canvasData }) => {
            // forward the recent drawnline to all the other players

            if (!(gameId in currentGamesMap)) {
                console.log("getting-non-drawers: unable to find the game")
            }
            // share drawing with other players in lobby
            else if (gameId in currentGamesMap) {
                let playersInGame = currrentGamesMap[gameId].players
                for (let p in playersInGame) {
                    if (p.id != playerId) {
                        gameNSP.to(p.id).emit("draw-on-canvas", canvasData)
                    }
                }
            }

            // if (!(gameId in currentGamesMap)) {
            //     console.log("getting-non-drawers: unable to find the game")
            //     return
            // }

            // // share current drawer line with other players
            // for (let currentPlayerId in currentGamesMap[gameId]) {
            //     if (playerId != currentPlayerId) {
            //         gameNSP.to(currentPlayerId).emit("draw-on-canvas", canvasData)
            //     }
            // }
        })

        // TODO either remove this or put into seperate game logic part
        socket.on("do-i-get-a-word", (gameId) => {
            let playerId = findCurrentPlayerTurn(gameId);
            gameNSP.to(playerId).emit("get-drawing-word", generateWord());
        })


        // TODO remove this from here and have the game obj handle this event on its own
        // omit flag to client if their canvas should be enabled or not
        socket.on("enable-drawing-canvas", (gameId) => {

            if (!(gameId in currentGamesMap)) {
                console.log("getting-non-drawers: unable to find the game");
            }
            else {
                // only enable canvas for players, whose turn it is
                if (gameId in currentGamesMap &&
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

            // if (!(gameId in currentGamesMap)) {
            //     console.log("getting-non-drawers: unable to find the game")
            //     return
            // }
            // let playerId = socket.id
            // if (gameId in currentGamesMap && playerId in currentGamesMap[gameId] && "player_turn" in currentGamesMap[gameId][playerId])
            //     var canvasDisabled = !currentGamesMap[gameId][playerId].player_turn

            // gameNSP.to(playerId).emit("toggle-drawing-canvas", canvasDisabled)

        })

        // TODO this logic is to be moved to seperate game server
        socket.on("game-started", gameId => {
            // TODO emit game start event to all clients

            for (let playerId in currentGamesMap[gameId]) {
                if (currentGamesMap[gameId][playerId].inGame && playerId != currentGamesMap[gameId].hostId) {
                    gameNSP.to(playerId).emit("start-game", { gameId, playerId })
                }

            }

            // for (let playerId in currentGamesMap[gameId]) {
            //     if (currentGamesMap[gameId][playerId].status === "active"
            //         && !currentGamesMap[gameId][playerId].host) {

            //         gameNSP.to(playerId).emit("start-game", { gameId, playerId })

            //     }

            // }

        })

        socket.on("close-game", gameId => {

            // delete tracking of which game player is in currently
            for (let player in currentGamesMap[gameId].players) {
                delete userToGameMap[player.id]
            }
            // delete the entire
            delete currentGamesMap[gameId]

            // // delete tracking of which game player is in currently
            // for (let playerSocID in currentGamesMap) {
            //     delete userToGameMap[playerSocID]
            // }
            // // delete the entire
            // delete currentGamesMap[gameId]


        })

        // clean up game map once user leaves, if host leaves then delete the entire gameid
        socket.on("disconnect", msg => {

            if (currentPlayerId in userToGameMap) {
                let player = currentGamesMap[userToGameMap[currentPlayerId]].players[currentPlayerId];
                if (player) {
                    player.inGame = false;
                    delete userToGameMap[currentPlayerId]
                }
            }


            // if (socket.id in userToGameMap) {
            //     let player = currentGamesMap[userToGameMap[socket.id]]
            //     if (player) {
            //         currentGamesMap[userToGameMap[socket.id]][socket.id].status = "closed"
            //         currentGamesMap[userToGameMap[socket.id]][socket.id].host = false;
            //         delete userToGameMap[socket.id]
            //     }

            // }

        })

    })

    io.on("connection", socket => {
        // generaic io events 
    })

}

module.exports = {
    currentGamesMap,
    intializeWSEvents
}