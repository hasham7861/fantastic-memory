module.exports = function intializeWSEvents(io) {
    const currentGamesMap = {
        // 'rand_game_id': ["id1", "id2", "id3"]
    };

    const userToGameMap = {
        //userId:gameId
    }

    let gameNSP = io.of('/game-nsp');
    gameNSP.on("connection", socket => {
        //send the id back to user to know who they are
        gameNSP.to(socket.id).emit("game-id", socket.id);
        // Host uses this event to intiate a namespace
        socket.on("initiate-game-lobby", data => {
            const gameId = data.gameId;
            if (!(gameId in currentGamesMap)) {
                currentGamesMap[gameId] = [socket.id];
                userToGameMap[socket.id] = gameId;
            }

            console.log(currentGamesMap);
        })
        // return list of players within the same game
        socket.on("players-in-game",gameId=>{
            const listOfPlayers =  gameId in currentGamesMap ? currentGamesMap[gameId] : []
            gameNSP.to(socket.id).emit("player-in-game",listOfPlayers);
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

        // clean up game map once user leaves, if host leaves then delete the entire gameid
        socket.on("disconnect", msg => {
            let game = currentGamesMap[userToGameMap[socket.id]];
            if (game && game.length <= 1) {
                delete currentGamesMap[userToGameMap[socket.id]];
            } else if(game && game.length > 1) {
                currentGamesMap[userToGameMap[socket.id]] = currentGamesMap[userToGameMap[socket.id]].filter(item => item !== socket.id)
            }
            delete userToGameMap[socket.id];
        })

    })

    io.on("connection", socket => {
        // generaic io events 
    })

}

