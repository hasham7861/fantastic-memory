const game = require('express')();
const crypto = require('crypto');
const { sleep } = require('../util/reusable');

const EventEmitter = require('events');
const { currentGamesMap } = require('../socket-events/webchat');

const gameEventEmitter = new EventEmitter();

const words = require("../database/category_of_words.json").words

// socket events game nsp
const gameNSP = io.of("/game-nsp");


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
        res.status(400).send("you need a gameId to start game")
    } else {
        res.send("game has started");
        gameEventEmitter.emit("start-game", gameId);
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

    // console.log(gameNSP)
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
        // emit event to all players that game has started
        gameNSP.to(player.id).emit("start-game", { gameId, playerId: player.id })
    }


    //  start rounds loop here
    for (let roundNum = 1; roundNum <= currentGamesMap[gameId].totalRounds; ++roundNum) {
        let currentPlayerTurnId = currentGamesMap[gameId].playerTurnId;

        // setup the screen for currentPlayerDrawing
        for (let playerId in currentGamesMap[gameId].players) {
            let currentPlayerCanvasDisabled = playerId !== currentPlayerTurnId;
            gameNSP.to(playerId).emit("toggle-drawing-canvas", currentPlayerCanvasDisabled);

            // generate random word to draw for player is currently turn it is
            let drawingWord = playerId === currentPlayerTurnId ? generateWord() : "";
            gameNSP.to(playerId).emit("get-drawing-word", drawingWord);

        }

        // start the timer for each round
        await sleep(currentGamesMap[gameId].timeForEachRound);

        // switch the playerId turn to another person.
        currentGamesMap[gameId].ChangeToDifferentPlayerId();

        console.log(`Round ${roundNum} is over. Player ${currentGamesMap[gameId].playerTurnId} turn to draw`);

    }
    return "Game should be over now"
})


module.exports = game;