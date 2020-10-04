const game = require('express')();
const crypto = require('crypto');

const EventEmitter = require('events');

const gameEventEmitter = new EventEmitter();

const { currentGamesMap } = require('../webchat');
const { connectToDB } = require('../database/db');

connectToDB()



const gameContexts = {
    // "gameId" : {"status":"not_started",gameRounds: {round1:{playerTurnId:"p1", playerWordToDraw:"pizza", timer:""},"pointsMap"}}
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
    }else{
        gameEventEmitter.emit("start-game","23")
    }

})



gameEventEmitter.once("start-game", async(gameId)=>{
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


})

module.exports = game;