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
        gameNSP.to(socket.id).emit("player-id", "player-id" +socket.id);
        
        socket.on("get-id",msg=>{
            gameNSP.to(socket.id).emit("recieve-host-id",socket.id);
        })
        // Host uses this event to intiate a namespace
        socket.on("join-game-lobby", data => {
            const gameId = data.gameId;
            console.log(gameId)
            if (!currentGamesMap.hasOwnProperty(gameId)) {
                currentGamesMap[gameId] = [socket.id];
                userToGameMap[socket.id] = gameId;
            }else{
                // only add the person with same socket once
                let alreadyJoinedGame = currentGamesMap[gameId].includes(socket.id)
                if(!alreadyJoinedGame)
                    currentGamesMap[gameId].push(socket.id)
            }

            console.log(currentGamesMap);
        })

        
        // return list of players within the same game
        socket.on("find-players-list",gameId=>{
            const listOfPlayers =  gameId in currentGamesMap ? currentGamesMap[gameId] : []
            // console.log(listOfPlayers)
            gameNSP.to(socket.id).emit("players-list",listOfPlayers);
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

