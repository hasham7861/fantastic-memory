const Game = require("../models/Game");
const gameSchema = require("../database/gameSchema");
const playerToGameSchema = require("../database/playerToGameSchema");

const Player = require("../models/Player");



// stores context of all games
global.currentGamesMap = {
    // '096ef6e3': new Game(...)
}


function initializeWSEvents(webSocketIo) {

    let gameNSP = webSocketIo.of('/game-nsp');
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
            if (!gameDoc) { return }

            let currentGame = new Game(gameDoc.game);

            if (!(gameDoc.game.players.hasOwnProperty(currentPlayerId))) {

                // remove old hostId from list
                delete currentGame.players[currentGame.hostId];

                currentGame.AddPlayerToGame(currentPlayerId);
                currentGame.hostId = currentPlayerId;
                currentGame.playerTurnId = currentPlayerId;

                // update the hostID, playerId, and players list upon update of host ID
                await gameSchema.findOneAndUpdate({ "gameId": gameId },
                    { "$set": { "game.hostId": currentGame.hostId, "game.playerTurnId": currentPlayerId, "game.players": currentGame.players } })
                    .catch((err) => console.log(err))

              

                await playerToGameSchema.createPlayer(currentPlayerId, gameId)
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

                    }))

                await playerToGameSchema.createPlayer(currentPlayerId, gameId)
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
                gameNSP.to(currentGame.hostId).emit("players-list", currentGame.players)
            }

        })


        // return list of players within the same game
        socket.on("find-players-list", async gameId => {

            let gameDoc = await gameSchema.fetchGame(gameId);

            if (gameDoc) {
                let gameObj = new Game(gameDoc.game);

                // TODO move this logic when user closes window
                // delete players from context of game when they closed out of game
                // await gameSchema.removePlayersNotInGame(gameId);
                for (let playerId in gameObj.players) {
                    if (gameObj.players.inGame == false) {
                        delete gameObj.players[playerId];
                    }
                }

                // update list of players in store
                await gameSchema.findOneAndUpdate({ "gameId": gameId }, { "$set": { "game.players": gameObj.players } })
                    .catch(() => console.log("unable to update player list"))


                // update player list 
                gameNSP.to(currentPlayerId).emit("players-list", gameObj.players)
            }

        })


        // share drawing with all the users within the same game
        socket.on("share-drawing-with-players", async ({ gameId, playerId, canvasData }) => {

            let gameDoc = await gameSchema.fetchGame(gameId);

            if (gameDoc) {
                let gameObj = new Game(gameDoc.game);

                for (let pId in gameObj.players) {
                    if (pId != playerId) {// all the players that don't match the current drawer
                        gameNSP.to(pId).emit("draw-on-canvas", canvasData)
                    }
                }
            }
        })



        // TODO set score of player based on drawing, increase score of player based on the correct guess word
        socket.on("check-guessed-word", ({ gameId, guessedWord }) => {

        })



        // clean up everything related to game from datastore
        socket.on("close-game", gameId => {
            /**
             *  clear up the game obj and player reference to game from datastore
             */

            gameSchema.removeGame(gameId);
            playerToGameSchema.removePlayersFromGame(gameId);
        })

        // clean up game map once user leaves, if host leaves then delete the entire gameid
        socket.on("disconnect", async () => {

            console.log('client discconect here')
            let playerDoc = await playerToGameSchema.fetchPlayer(currentPlayerId);

            if (playerDoc) {
                await playerToGameSchema.removePlayerFromGame(currentPlayerId);
                console.log(playerDoc.gameId, currentPlayerId)
                await gameSchema.removePlayerFromGame(playerDoc.gameId, currentPlayerId);
                // await gameSchema.removePlayersNotInGame(gameId);
                // 
            }

            // await playerToGameSchema.removePlayerFromGame(currentPlayerId);
            // console.log("playerDoc "+playerDoc.gameId)
            // if (currentPlayerId in userToGameMap) {
            //     let gameId = userToGameMap[currentPlayerId];
            //     let player = currentGamesMap[gameId].players[currentPlayerId];
            //     if (player) {
            //         player.inGame = false;
            //         delete userToGameMap[currentPlayerId];
            //         delete currentGamesMap[gameId].players[currentPlayerId];
            //     }
            // }
        })

    })

    webSocketIo.on("connection", socket => {
        // generic io events 
    })


}



module.exports = {
    currentGamesMap,
    initializeWSEvents
}