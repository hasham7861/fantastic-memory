const game = require('express')();
const crypto = require('crypto');

const EventEmitter = require('events');

const gameEventEmitter = new EventEmitter();

const { currentGamesMap, gameNSP } = require('../socket-events/webchat');
const words = require("../database/category_of_words.json").words

function generateWord() {
    let randomNumIndex = Math.floor(Math.random() * words.length - 1)
    return words[randomNumIndex]
}

game.get("/generate_game_id", (req, res) => {
    crypto.randomBytes(4, function (err, buffer) {
        if (err)
            res.status(404).send("generate_game_token err: unable to generate random game token");
        res.send({ gameId: buffer.toString('hex') });
    });
})

game.get("/is_valid_game_id", (req, res) => {
    if (!req.query.inputGameId)
        return res.status(400).send("valid_game_id: missing inputGameId query param")

    if (!currentGamesMap)
        return res.status(403).send("valid_game_id: there isn't any games going on")

    let inputGameId = req.query.inputGameId.slice(0, 8);

    if (inputGameId in currentGamesMap) {
        res.send({ game_id_valid: true })
    } else {
        res.send({ game_id_valid: false })
    }

})

game.post("/start_game", (req, res) => {
    /** //FIXME
     * when host of the game, clicks starts game,
     * emit event start game-loop, which starts game loop
     */

    const gameId = req.body.gameId;

    if (!gameId) {
        req.status(400).send("you need a gameId to start game")
    } else {
        gameEventEmitter.emit("start-game", "23")
    }

})



gameEventEmitter.once("start-game", async (gameId) => {
    //TODO keep track of timer, points, and switch turns here
    /**
     * gameloop
     * this should also emit event to all the other players listening in to start game
     * generate a word for player, and keep track of it in game.
     * this game loop starts a timer for 30 seconds, then switch turn to another player
     * keep tally of rounds
     * once rounds reach 3 rounds, stop game for all players
     * show score of game
     * save score for each person in file somewhere after game is over
     */

    if (!gameNSP) {
        console.log("start-game-event: gameNSP hasn't been intialized yet")
        return;
    }

    if (!(gameId in currentGamesMap)) {
        console.log("start-game-event: unable to start game");
        return;
    }

    if (!currentGamesMap[gameId].players) {
        console.log("start-game-event: unable to find players to start game for");
        return;
    }


    // emiting event to other users that game has started
    for (let playerId in currentGamesMap[gameId].players) {
        let player = currentGamesMap[gameId].players[playerId];
        if (player.inGame && player.id != currentGamesMap[gameId].hostId) {
            gameNSP.to(player.id).emit("start-game", { gameId, playerId: player.id })
        }
    }

    //  TODO should start rounds loop here

    for (let roundNum of [1, 2, 3]) {
        // generate random word, and send to correct person
        let playerId = findCurrentPlayerTurn(gameId);
        gameNSP.to(playerId).emit("get-drawing-word", generateWord());

        // TODO start timer for 60 seconds, for the person to start drawing, and then switch turns


    }



})

module.exports = game;