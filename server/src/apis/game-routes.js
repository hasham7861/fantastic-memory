const game = require('express')();
const crypto = require('crypto');
const EventEmitter = require('events');

const { sleep } = require('../util/reusable');
const words = require("../database/category_of_words.json").words;

const {Game} = require("../models/Game");


const gameSchema = require("../database/gameSchema");

const gameEventEmitter = new EventEmitter();

function generateWord() {
    let randomNumIndex = Math.floor(Math.random() * words.length - 1)
    return words[randomNumIndex]
}


module.exports = function (webSocketIo) {

    const gameNSP = webSocketIo.of("/game-nsp");

    game.get("/generate_game_id", (req, res) => {
        crypto.randomBytes(4, function (err, buffer) {
            if (err)
                res.status(404).send("generate_game_token err: unable to generate random game token");
            res.send({ gameId: buffer.toString('hex') });
        });
    })

    game.get("/is_valid_game_id", (req, res) => {
        if (!req.query.inputGameId)
            return res.status(400).send("valid_game_id: missing inputGameId query param");

        let inputGameId = req.query.inputGameId.slice(0, 8);

        return gameSchema.doesGameExist(inputGameId).then(gameExist => {
            if (gameExist)
                res.send({ game_id_valid: true })
            else
                res.send({ game_id_valid: false })

        })
    })

    game.post("/guess_word", async (req,res)=>{
        if(!req.body.gameId || !req.body.guessedWord || !req.body.playerId || !req.body.roundNum){
            return res.status(400).send("guessed_word: missing props in body");
        }

        /**
         * //TODO 
         * 1. check if the guessed word matches the word given to current host of the game
         * 2. if word matches, return a feedback to user that they guessed the word 
         *     and disable the input field for them for the current round and add 1 point to the player who guessed the word in gameMap
         * 3. otherwise return a feedback to user that please try rephrasing or different word
         */

        let { guessedWord } = req.body.guessedWord.toLowerCase();

        let guessedWordMatches = await gameSchema.isValidGuessedWordOfRound(gameId, guessedWord, roundNum);

        if(guessedWordMatches){
            gameSchema.addPointsToPlayer(gameId, playerId, 1);
        }

        res.send({"wordMatches": guessedWordMatches});
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



    gameEventEmitter.on("start-game", async (gameId) => {
        //keep track of timer, points, and switch turns here
        /**
         * this should also emit event to all the other players listening in to start game
         * generate a word for player, and keep track of it in game.
         * this game loop starts a timer for 30 seconds, then switch turn to another player
         * keep tally of rounds
         * once rounds reach 3 rounds, stop game for all players
         * show score of game
         * save score for each person in file somewhere after game is over
         */

        if (!gameNSP) {
            console.log("start-game-event: gameNSP hasn't been initialized yet");
            return;
        }

        const gameDoc = await gameSchema.fetchGame(gameId);
      
        const gameObj = new Game(gameDoc.game);
     

        if (!gameObj) {
            console.log("start-game-event: unable to start game");
            return;
        }

        // emitting event to other users that game has started
        for (let playerId in gameObj.players) {
            let player = gameObj.players[playerId];
            // emit event to all players that game has started
            gameNSP.to(player.id).emit("start-game", { gameId, playerId: player.id })
        }


        //  start rounds loop here
        for (let roundNum = 1; roundNum <= gameObj.totalRounds; ++roundNum) {
            let currentPlayerTurnId = gameObj.playerTurnId;
            
            // setup the screen for currentPlayerDrawing
            for (let playerId in gameObj.players) {
                let isMyTurn = playerId == currentPlayerTurnId;
                gameNSP.to(playerId).emit("toggle-drawing-canvas", !isMyTurn);

                // generate random word to draw for player is currently turn it is
                let drawingWord = playerId === currentPlayerTurnId ? generateWord() : "";
                gameNSP.to(playerId).emit("drawing-word", drawingWord);
                gameObj.gameRounds[roundNum-1].wordToGuess = drawingWord;

                // emitting to weather or not to enable input for guessing word
                gameNSP.to(playerId).emit("is-my-turn", isMyTurn);
            }

            // update time left for drawing player
            let timeLeftInterval = setInterval(() => {
                gameObj.timeForEachRound -= 1000;
                gameNSP.to(currentPlayerTurnId).emit("update-time-left", gameObj.timeForEachRound / 1000);
            }, 1000)
            // start the timer for each round
            await sleep(gameObj.timeForEachRound);

            clearInterval(timeLeftInterval);
            gameObj.ResetTimeLeft();

            // switch the playerId turn to another person.
            gameObj.ChangeToDifferentPlayerId();

            // update game round
            gameObj.currentGameRound+=1;
    
            gameSchema.updateGame(gameObj.gameId,gameObj);

            console.log(`Round ${roundNum} is over. Player ${gameObj.playerTurnId} turn to draw`);

            

        }
        return "Game should be over now"
    })




    return game;
}



