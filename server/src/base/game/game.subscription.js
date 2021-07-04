import Game from "./game.model.js"
import gameSchema from "./game.schema.js"
import playerToGameSchema from "../player/player.schema.js"
import Player from "../player/player.model.js"

import sharedSession from 'express-socket.io-session'


export function initializeGameNSP(webSocketIo, sessionMiddleware) {

    const gameNSP = webSocketIo.of('/game-nsp')
                        // binding the namespace with express session store
                        .use(sharedSession(sessionMiddleware,{
                            autoSave: true
                        }))

    gameNSP.on("connection", socket => {

        const currentConnectedSocketId = socket.id
        const currentPlayerId = socket.id
        // const socketAndExpressSessionBind = socket.handshake.session

        //send the id back to user to know who they are
        gameNSP.to(currentConnectedSocketId).emit("player-id", currentPlayerId)


        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("player-id", currentPlayerId);
        })

        socket.on("set-username", ({username})=>{
            // set username in express app session and set socket id in session tied to username
            socket.handshake.session.currentPlayerUsername = username
            socket.handshake.session.socketId = socket.id
            socket.handshake.session.save()
            
        })

        socket.on("add-username-to-game", ({username, gameId})=>{
            /** // TODO 
             * Add provided username under the game, associated with gameId
             * associate the username with the game id with a current socketId and the status of this socketId if it alive or not, 
             *  if socketId of Connected username is offline then allow another player to use same name in the same game
             */
            console.log(username, gameId)
        })
        /**
         * Update host player Id upon refresh of host page 
         * */
        socket.on("update-host-id", async gameId => {
            // TODO most likely deprecate this
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

            // TODO update this method so that we now asscoaite username with gameId

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
            // TODO instead of getting playerId get player usernames in game
            const emitPlayerId = currentPlayerId;
            emitUpdatedPlayersListInGame(gameNSP, gameId, emitPlayerId);
        })

        socket.on("load-players", async (gameId) => {
            // TODO why is there duplicate method as above ^
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
            // TODO refactor so that you take gameId, playerUsername and canvasData and emit to every other username in game beside yourself
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
            // TODO refactor so get players and score based on usernames
            const playersList = await gameSchema.getCurrentRoundPlayers(gameId)
            gameNSP.to(currentPlayerId).emit("load-players-list", { "players": playersList, "currentPlayerId": currentPlayerId })
        })

        socket.on("stop-all-players-game", async (gameId) =>{
            // TODO refactor to gamover screen based on usernames mapped to socketId
            const gameDoc = await gameSchema.fetchGame(gameId);

            if (gameDoc) {
                const gameObj = new Game(gameDoc.game);

                for (const pId in gameObj.players) {
                    gameNSP.to(pId).emit("navigate-to-gameover-screen",)
                }
            }

            
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
            // TODO try to search for usernames in games based on a currentSocketId and then disconnect them
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
    // TODO refactor so get playerslist by username
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


        // update player list 
        gameNSP.to(emitPlayerId).emit("players-list", gameObj.players)

    }
}