const Game = require("../models/Game");
const gameSchema = require("../database/gameSchema");
const playerToGameSchema = require("../database/playerToGameSchema");

const Player = require("../models/Player");
const game = require("../apis/game");


// stores context of all games
global.currentGamesMap = {
    // '096ef6e3': new Game(...)
}

// map which allows server to query for which game a player is currently in
const userToGameMap = {
    //userId:gameId
}

// function findHostOfGame(gameId) {
//     if (gameId && gameId in currentGamesMap) {
//         return currentGamesMap[gameId].hostId;
//     } else {
//         return null;
//     }
// }

function findCurrentPlayerTurn(gameId) {
    if (gameId && gameId in currentGamesMap) {
        return currentGamesMap[gameId].playerTurnId;
    } else {
        return null;
    }
}



function initializeWSEvents() {


    let gameNSP = io.of('/game-nsp');
    gameNSP.on("connection", socket => {

        let currentPlayerId = socket.id;

        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("player-id", currentPlayerId);


        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("player-id", currentPlayerId);
        })

        /**
         * Update host player Id upon refresh of host page 
         * */
        socket.on("update-host-id", async gameId => {

            let gameDoc = await gameSchema.fetchGame(gameId);

            // check if the game exists
            if (!gameDoc) { console.log("can't find a game"); return }

            let currentGame = new Game(gameDoc.game);
            if (!(gameDoc.game.players.hasOwnProperty(currentPlayerId))) {
                currentGame.AddPlayerToGame(currentPlayerId);
                currentGame.hostId = currentPlayerId;
                currentGame.playerTurnId = currentPlayerId;

                // update the hostID, playerId, and players list upon update of host ID
                await gameSchema.findOneAndUpdate({ "gameId": gameId },
                    { "$set": { "game.hostId": currentGame.hostId, "game.playerTurnId": currentPlayerId, "game.players": currentGame.players } })
                    .catch((err) => console.log(err))

                await playerToGameSchema.createPlayer(currentPlayerId, gameId).catch(() => console.log("unable to create player"))
            }

        })
        /**
         * Host uses this event to initiate a game 
         * */
        socket.on("join-game-lobby", async ({ gameId }) => {

            let gameDoc = await gameSchema.fetchGame(gameId);

            // Game doesn't exist in the store
            if (!gameDoc) {
                await gameSchema.createGame(gameId,
                    new Game({
                        gameId,
                        players: {
                            [currentPlayerId]: new Player(currentPlayerId)
                        },
                        status: "MENU",
                        hostId: currentPlayerId,
                        playerTurnId: currentPlayerId

                    })).catch(() => console.log("unable to create game"))

                await playerToGameSchema.createPlayer(currentPlayerId, gameId).catch(() => console.log("unable to create player"))
            }
            // when game exists
            else if (gameDoc) {
                let currentGame = new Game(gameDoc.game);
                if (!(gameDoc.game.players.hasOwnProperty(currentPlayerId))) {
                    currentGame.AddPlayerToGame(currentPlayerId);

                    // update players obj within mongo
                    await gameSchema.findOneAndUpdate({ "gameId": gameId }, { "$set": { "game.players": currentGame.players } })
                        .catch((err) => console.log(err))
                }

                // update list of players for client
                gameNSP.to(currentGame.hostId).emit("players-list", gameDoc.game.players)
            }

        })


        // return list of players within the same game
        socket.on("find-players-list", async gameId => {

            let gameDoc = await gameSchema.fetchGame(gameId);

            // if (!gameDoc) console.log("can't find a game");

            // else if (gameDoc) {
            //     let gameObj = new Game(gameDoc.game);

            //     // delete players from context of game when they closed out of game
            //     for (let playerSocId in gameObj.players) {
            //         if (!gameObj.players.inGame)
            //             delete gameObj.players[playerSocId]
            //     }

            //     // update list of players in store
            //     await gameSchema.findOneAndUpdate({ "gameId": gameId }, { "$set": { "game.players": gameObj.players } })
            //         .catch(() => console.log("unable to update player list"))

            //     gameNSP.to(currentPlayerId).emit("players-list", listOfPlayers)
            // }

            // if (!(currentGamesMap.hasOwnProperty(gameId))) {
            //     return
            // }

            // let listOfPlayers = gameId in currentGamesMap ? currentGamesMap[gameId].players : {}

            // // delete players from context of game when they closed out of game
            // for (let playerSocId in listOfPlayers) {
            //     if (!listOfPlayers[playerSocId].inGame)
            //         delete listOfPlayers[playerSocId]
            // }

            // currentGamesMap[gameId].players = listOfPlayers;

            // gameNSP.to(currentPlayerId).emit("players-list", listOfPlayers)

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



        // TODO set score of player based on drawing, increase score of player based on the correct guess word
        socket.on("check-guessed-word", ({ gameId, guessedWord }) => {

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
        // generic io events 
    })

    global.gameNSP = gameNSP;
}



module.exports = {
    currentGamesMap,
    initializeWSEvents,
    findCurrentPlayerTurn
}