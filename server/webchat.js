// TODO store all gamesdata into data store like mongo, and for faster access store the data into memache service
// const { connectToDB } = require('./db');
const words = require("./database/category_of_words.json").words

const currentGamesMap = {
    // '096ef6e3': {
    //   '/game-nsp#xDyy_b7cqqQoqZeLAAAC': { status: 'active', host: true, player_turn: true },
    //   '/game-nsp#vIzy3GqOlps3GUqRAAAB': { status: 'closed', host: false, player_turn: false},
    //   '/game-nsp#mZOGYqfjFUcNhu1DAAAF': { status: 'active', host: false, player_turn: false }
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

function findCurrentPlayerTurn(gameId){
    for (let playerSocId in currentGamesMap[gameId]) {
        if (currentGamesMap[gameId][playerSocId].player_turn)
            return playerSocId
    }
}

function generateWord(){
    let randomNumIndex = Math.floor(Math.random() * words.length-1)
    return words[randomNumIndex]
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
           
            if(gameId in currentGamesMap && socket.id in currentGamesMap[gameId]){
                currentGamesMap[gameId][socket.id] = { status: 'active', host: true, player_turn: true }
                userToGameMap[socket.id] = gameId       
            }

        })
        // Host uses this event to intiate a namespace
        socket.on("join-game-lobby", data => {
            const gameId = data.gameId;
            const playerIndexStart = data.playerIndexStart


            if (!currentGamesMap.hasOwnProperty(gameId)) {
                currentGamesMap[gameId] = { [socket.id]: { status: 'active', host: true, player_turn: true } }
                userToGameMap[socket.id] = gameId;
            } else {
                // only add the person with same socket once
                let alreadyJoinedGame = socket.id in currentGamesMap[gameId]
                if (!alreadyJoinedGame) {
                    currentGamesMap[gameId][socket.id] = { status: 'active', host: false, player_turn: false }
                    userToGameMap[socket.id] = gameId;
                }
            }

            // setting turn of the right player
            if (Object.keys(currentGamesMap[gameId])[playerIndexStart]) {
                Object.keys(currentGamesMap[gameId])[playerIndexStart].player_turn = true
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


        // share drawing with all the users within the same game
        socket.on("share-drawing-with-players", ({ gameId, playerId, canvasData }) => {
            // forward the recent drawnline to all the other players

            if (!(gameId in currentGamesMap)) {
                console.log("getting-non-drawers: unable to find the game")
                return
            }

            // share current drawer line with other players
            for (let currentPlayerId in currentGamesMap[gameId]) {
                if (playerId != currentPlayerId) {
                    gameNSP.to(currentPlayerId).emit("draw-on-canvas", canvasData)
                }
            }
        })

        socket.on("do-i-get-a-word", (gameId)=>{
            let playerId = findCurrentPlayerTurn(gameId)
            gameNSP.to(playerId).emit("get-drawing-word", generateWord())
        })


        // omit flag to client if their canvas should be enabled or not
        socket.on("enable-drawing-canvas", (gameId) => {

            if (!(gameId in currentGamesMap)) {
                console.log("getting-non-drawers: unable to find the game")
                return
            }
            let playerId = socket.id
            if(gameId in currentGamesMap && playerId in currentGamesMap[gameId] && "player_turn" in currentGamesMap[gameId][playerId])
                var canvasDisabled = !currentGamesMap[gameId][playerId].player_turn

            gameNSP.to(playerId).emit("toggle-drawing-canvas", canvasDisabled)
            
        })

        // TODO this logic is to be moved to seperate game server
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