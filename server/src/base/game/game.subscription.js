const Game = require("./game.model")
const gameSchema = require("./game.schema")
const playerToGameSchema = require("../player/player.schema")

const Player = require("../player/player.model");


function initializeGameNSP(webSocketIo) {

    const gameNSP = webSocketIo.of('/game-nsp');
    gameNSP.on("connection", socket => {

        const currentPlayerId = socket.id;

        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("player-id", currentPlayerId);


        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("player-id", currentPlayerId);
        })

        /**
         * Update host player Id upon refresh of host page 
         * */
        socket.on("update-host-id", async gameId => {

            const gameDoc = await gameSchema.fetchGame(gameId);

            // check if the game exists
            if (!gameDoc) { return }

            const currentGame = new Game(gameDoc.game);

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

            const gameDoc = await gameSchema.fetchGame(gameId);

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
                const currentGame = new Game(gameDoc.game);
                if (!(gameDoc.game.players.hasOwnProperty(currentPlayerId))) {
                    currentGame.AddPlayerToGame(currentPlayerId);
                    // update players obj within mongo
                    await gameSchema.findOneAndUpdate({ "gameId": gameId }, { "$set": { "game.players": currentGame.players } })
                        .catch((err) => console.log(err))
                }

                await playerToGameSchema.createPlayer(currentPlayerId, gameId)

                // update list of players for client
                gameNSP.to(currentGame.hostId).emit("players-list", currentGame.players)

            }

        })


        // return list of players within the same game
        socket.on("find-players-list", gameId => {
            const emitPlayerId = currentPlayerId;
            emitUpdatedPlayersListInGame(gameNSP, gameId, emitPlayerId);
        })

        socket.on("load-players", async (gameId) => {

            if (!gameId)
                return
            console.log(gameId, currentPlayerId)
            const playersList = await gameSchema.getCurrentRoundPlayers(gameId)

            const gameDoc = await gameSchema.fetchGame(gameId);

            const gameObj = new Game(gameDoc.game);

            for (const playerId in gameObj.players) {
                console.log(playersList)
                // emite player list to game dashboard
                gameNSP.to(playerId).emit("load-players-list", { "players": playersList, "currentPlayerId": currentPlayerId })
            }

        })


        // share drawing with all the users within the same game
        socket.on("share-drawing-with-players", async ({ gameId, playerId, canvasData }) => {

            const gameDoc = await gameSchema.fetchGame(gameId);

            if (gameDoc) {
                const gameObj = new Game(gameDoc.game);

                for (const pId in gameObj.players) {
                    if (pId != playerId) {// all the players that don't match the current drawer
                        gameNSP.to(pId).emit("draw-on-canvas", canvasData)
                    }
                }
            }
        })

        socket.on("get-players-and-score", async (gameId) => {
            const playersList = await gameSchema.getCurrentRoundPlayers(gameId)
            gameNSP.to(currentPlayerId).emit("load-players-list", { "players": playersList, "currentPlayerId": currentPlayerId })
        })

        // clean up everything related to game from datastore
        socket.on("close-game", gameId => {
            /**
             *  clear up the game obj and player reference to game from datastore
             */

            gameSchema.removeGame(gameId);

        })

        // clean up game map once user leaves, if host leaves then delete the entire gameid
        socket.on("disconnect", async () => {

            const playerDoc = await playerToGameSchema.fetchPlayer(currentPlayerId);

            if (playerDoc) {
                const playerGameId = playerDoc.gameId;

                await gameSchema.setPlayerNotInGame(playerGameId, currentPlayerId);
                await gameSchema.removePlayerFromGame(playerGameId, currentPlayerId);
                await playerToGameSchema.removePlayerFromGame(currentPlayerId);

                await emitUpdatedPlayersListInGame(gameNSP, playerGameId);

            }
        })

    })

}

async function emitUpdatedPlayersListInGame(gameNSP, gameId, emitPlayerId = null) {
    const gameDoc = await gameSchema.fetchGame(gameId);
    if (gameDoc) {
        
        const gameObj = new Game(gameDoc.game);
        
        // if there is no player id specifiy to emit then emit to host id
        if (!emitPlayerId) {
            emitPlayerId = gameObj.hostId;
        }

        // TODO move this logic when user closes window
        // delete players from context of game when they closed out of game
        // await gameSchema.removePlayersNotInGame(gameId);
        for (const playerId in gameObj.players) {
            if (gameObj.players.inGame == false) {
                delete gameObj.players[playerId];
            }
        }
        
        // update list of players in store
        await gameSchema.findOneAndUpdate({ "gameId": gameId }, { "$set": { "game.players": gameObj.players } })
        .catch(() => console.log("unable to update player list"))
        
        console.log('attempting to send player list', emitPlayerId, gameObj.players)

        // update player list 
        gameNSP.to(emitPlayerId).emit("players-list", gameObj.players)

    }else{
        // The first time host request to make game the game doc is not yet created
        gameNSP.to(emitPlayerId).emit("players-list", {
           [emitPlayerId]: {

           }}
        )

    }
}


module.exports = {
    initializeGameNSP
}