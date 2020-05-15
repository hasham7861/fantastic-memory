module.exports = function intializeWSEvents(io) {
    const currentGamesMap = {
        // 'rand_game_id': ["id1", "id2", "id3"]
    };

    io.on("connection", socket => {
        console.log(`user: ${socket.id} joined`);
    })

    // TODO: client sends in a game id, and add them into current games map
    io.on("match-making", socket => {

    })

    // TODO: share drawing with all the users within the same game
    io.on("share-drawing", socket => {

    })

    // TODO: share text messages with all all the users in the same game
    io.on("send-message", socket => {

    })

    // TODO: clean up game map once user leaves, if host leaves then delete the entire gameid
    io.on("remove-user-from-game", socket => {

    })
}

