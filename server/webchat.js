// TODO store all gamesdata into data store like mongo, and for faster access store the data into memache service
const { connectToDB } = require('./db');

const currentGamesMap = {
    // '096ef6e3': {
    //   '/game-nsp#xDyy_b7cqqQoqZeLAAAC': { status: 'active', host: true },
    //   '/game-nsp#vIzy3GqOlps3GUqRAAAB': { status: 'closed', host: false },
    //   '/game-nsp#mZOGYqfjFUcNhu1DAAAF': { status: 'active', host: false }
    // }
}

const userToGameMap = {
    //userId:gameId
}

function findHostOfGame(gameId) {
    for (let playerSocId in currentGamesMap[gameId]) {
        if (currentGamesMap[gameId][playerSocId].host)
            return playerSocId
    }
}

function getCurrentNonDrawingPlayers(gameId, playerId) {
    if (!(gameId in currentGamesMap)) {
        console.log("getting-non-drawers: unable to find the game")
        return
    }
    console.log(playerId)
    let players = []
    for (let currentPlayerId in currentGamesMap[gameId]) {
        if (playerId != currentPlayerId) {
            players.push(currentPlayerId)
        }
    }
    return players
}


function intializeWSEvents(io) {


    let gameNSP = io.of('/game-nsp');
    gameNSP.on("connection", socket => {
        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("player-id", socket.id);

        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("player-id", socket.id);
        })

        socket.on("update-host-id", gameId => {
            // const oldHostSocId = findHostOfGame(gameId);
            currentGamesMap[gameId][socket.id] = { status: 'active', host: true }
            userToGameMap[socket.id] = gameId
            // currentGamesMap[gameId][oldHostSocId].status="closed"
            // currentGamesMap[gameId][oldHostSocId].host=false

        })
        // Host uses this event to intiate a namespacetr
        socket.on("join-game-lobby", data => {
            const gameId = data.gameId;

            if (!currentGamesMap.hasOwnProperty(gameId)) {
                currentGamesMap[gameId] = { [socket.id]: { status: 'active', host: true } }
                userToGameMap[socket.id] = gameId;
            } else {
                // only add the person with same socket once
                let alreadyJoinedGame = socket.id in currentGamesMap[gameId]
                if (!alreadyJoinedGame) {
                    currentGamesMap[gameId][socket.id] = { status: 'active', host: false }
                    userToGameMap[socket.id] = gameId;
                }
            }

            // console.log(currentGamesMap);
            let hostSocId = findHostOfGame(gameId)
            // console.log(hostSocId)
            gameNSP.to(hostSocId).emit("players-list", currentGamesMap[gameId])
        })


        // return list of players within the same game
        socket.on("find-players-list", gameId => {
            let listOfPlayers = gameId in currentGamesMap ? currentGamesMap[gameId] : []
            // filter listOfPlayers to return all players that are still in the game
            for (let playerSocId in listOfPlayers) {
                if (listOfPlayers[playerSocId].status == "closed")
                    delete listOfPlayers[playerSocId]
            }

            gameNSP.to(socket.id).emit("players-list", listOfPlayers);
        })

        // TODO: client sends in a game id, and add them into current games map
        socket.on("match-making", msg => {

        })

        // TODO: share drawing with all the users within the same game
        socket.on("share-drawing-with-players", ({ gameId, playerId, recentDrawnLine }) => {
            // forward the recent drawnline to all the other players

            let listOfNonDrawers = getCurrentNonDrawingPlayers(gameId, playerId)
            // share current drawer line with other players
            for (let currentPlayerId of listOfNonDrawers) {
                gameNSP.to(currentPlayerId).emit("draw-on-canvas", recentDrawnLine)
            }

            // console.log(listOfNonDrawers)
        })

        // TODO: share text messages with all all the users in the same game
        socket.on("send-message", msg => {

        })

        socket.on("game-started", gameId => {
            // TODO emit game start event to all clients

            for (let playerId in currentGamesMap[gameId]) {
                if (currentGamesMap[gameId][playerId].status === "active"
                    && !currentGamesMap[gameId][playerId].host) {

                    gameNSP.to(playerId).emit("start-game", { gameId, playerId })

                }

            }

        })

        socket.on("close-game", gameId => {
            let game = currentGamesMap[gameId]
            // delete tracking of which game player is in currently
            for (let playerSocID in currentGamesMap) {
                delete userToGameMap[playerSocID]
            }
            // delete the entire
            delete currentGamesMap[gameId]


        })

        // clean up game map once user leaves, if host leaves then delete the entire gameid
        socket.on("disconnect", msg => {
            if (socket.id in userToGameMap) {
                let player = currentGamesMap[userToGameMap[socket.id]]
                if (player) {
                    currentGamesMap[userToGameMap[socket.id]][socket.id].status = "closed"
                    currentGamesMap[userToGameMap[socket.id]][socket.id].host = false;
                    delete userToGameMap[socket.id]
                }

            }



            // auto kick off non host players from the game once they close window
            // if (player.status == "active" ) {
            //     player.status = "closed";
            //     player.host= false;
            //     delete userToGameMap[socket.id];
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