
module.exports = function intializeWSEvents(io) {
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
    let gameNSP = io.of('/game-nsp');
    gameNSP.on("connection", socket => {
        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("player-id", "player-id" + socket.id);

        socket.on("get-id", _ => {
            gameNSP.to(socket.id).emit("recieve-host-id", socket.id);
        })
        socket.on("update-host-id", gameId => {
            const oldHostSocId = findHostOfGame(gameId);
            currentGamesMap[gameId] = { [socket.id]: {...currentGamesMap[gameId][oldHostSocId]}}
            delete currentGamesMap[oldHostSocId]
            delete userToGameMap[oldHostSocId]
        })
        // Host uses this event to intiate a namespace
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

            console.log(currentGamesMap);
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
        socket.on("share-drawing", msg => {

        })

        // TODO: share text messages with all all the users in the same game
        socket.on("send-message", msg => {

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
            let game = currentGamesMap[userToGameMap[socket.id]];

            // auto kick off non host players from the game once they close window
            if (game && game[socket.id].status == "active" && !game[socket.id].host) {
                currentGamesMap[userToGameMap[socket.id]][socket.id].status = "closed";
                delete userToGameMap[socket.id];
            }
        })

    })

    io.on("connection", socket => {
        // generaic io events 
    })

}

