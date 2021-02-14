const crypto = require('crypto');
const EventEmitter = require('events');
const {isEmpty, isNil, keysIn}= require('ramda')

const { sleep } = require('../util/reusable');
const words = require("../database/category_of_words.json").words;

const { Game } = require("../models/Game");


const gameSchema = require("../database/gameSchema");

const gameEventEmitter = new EventEmitter();

function generateWord() {
    const randomNumIndex = Math.floor(Math.random() * words.length)
    return words[randomNumIndex]
}

const getRelativePath = (route) => "/game/" + route


module.exports = function (webSocketIo, app) {

    const gameNSP = webSocketIo.of("/game-nsp");
    
    app.get(getRelativePath("generate_game_id"), (req, res) => {
        crypto.randomBytes(4, function (err, buffer) {
            if (err)
                res.status(404).send("generate_game_token err: unable to generate random game token");
            res.send({ gameId: buffer.toString('hex') });
        });
    })

    app.get(getRelativePath("is_valid_game_id") , async (req, res) => {
        if (!req.query.inputGameId)
            return res.status(400).send("valid_game_id: missing inputGameId query param");

        const inputGameId = req.query.inputGameId.slice(0, 8);

        const gameDoc = await gameSchema.fetchGame(inputGameId)
        const gameExists = !isNil(gameDoc.game) || !isEmpty(gameDoc.game);
        if(!gameExists){
            res.send({ game_id_valid: false, error_message:"gameId is invalid"})
        }
        const playersExist = !isEmpty(gameDoc.game.players)
        
        if(playersExist){
            const gameLobbyPlayerLimit = 3
            if(keysIn(gameDoc.game.players).length >= gameLobbyPlayerLimit )
                res.send({game_id_valid: false, error_message:"max 3 players allowed in lobby"})
        }
       
        return res.send({ game_id_valid: true, error_message:""})
         
    })

    app.post(getRelativePath("guess_word"), async (req, res) => {

        const { gameId, playerId } = req.body;

        if (!gameId ||
            !req.body.guessedWord ||
            !playerId) {
            return res.status(400).send("guessed_word: missing props in body");
        }

        const guessedWord = req.body.guessedWord.toLowerCase()

        /**
         * //TODO 
         * 1. check if the guessed word matches the word given to current host of the game
         * 2. if word matches, return a feedback to user that they guessed the word 
         *     and disable the input field for them for the current round and add 1 point to the player who guessed the word in gameMap
         * 3. otherwise return a feedback to user that please try rephrasing or different word
         */


        const guessedWordMatches = await gameSchema.isValidGuessedWordOfRound(gameId, guessedWord);
        console.log(gameId, playerId, 1)
        if (guessedWordMatches) {
            await gameSchema.addPointsToPlayer(gameId, playerId, 1);
        }


        res.send({ "wordMatches": guessedWordMatches });
    })


    app.post(getRelativePath("start_game"), (req, res) => {
        /** //FIXME
         * when host of the game, clicks starts game,
         * emit event start game-loop, which starts game loop
         */

       
        const gameId = req.body.gameId;

        if (!gameId) {
            res.status(400).send("you need a gameId to start game")
        } else {
            gameEventEmitter.emit("start-game", gameId);
            res.send("game has started");
            
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
        for (const playerId in gameObj.players) {
            const player = gameObj.players[playerId];
            // emit event to all players that game has started
            gameNSP.to(player.id).emit("start-game", { gameId, playerId: player.id })
        }


        //  start rounds loop here
        for (let roundNum = 1; roundNum <= gameObj.totalRounds; roundNum++) {
            const currentPlayerTurnId = gameObj.playerTurnId;
            // generate random word to draw for player is currently turn it is
            const drawingWord = generateWord();

            const playersList = await gameSchema.getCurrentRoundPlayers(gameId)
               

            // setup the screen for currentPlayerDrawing
            for (const playerId in gameObj.players) {
                const isMyTurn = playerId == currentPlayerTurnId;
                gameNSP.to(playerId).emit("toggle-drawing-canvas", !isMyTurn);

                // emitting to weather or not to enable input for guessing word
                gameNSP.to(playerId).emit("is-my-turn", isMyTurn);

                if (isMyTurn) {
                    gameNSP.to(playerId).emit("drawing-word", drawingWord);
                } else {
                    // If it isn't your turn then rest the word
                    gameNSP.to(playerId).emit("drawing-word", "");
                }

                // emite player list to game dashboard
                gameNSP.to(playerId).emit("load-players-list", {"players": playersList, "currentPlayerId":currentPlayerTurnId})

                // this should reset all canvas on start of gameround
                gameNSP.to(playerId).emit("draw-on-canvas", {lines:[]})
                    
                
            }


            gameObj.gameRounds[roundNum - 1].wordToGuess = drawingWord;
            await gameSchema.updateGame(gameSchema.FILTER_QUERIES.filterGame(gameObj.gameId),
                gameSchema.UPDATE_QUERIES.updateGameRounds(gameObj.gameRounds))


            // update time left for drawing player
            const timeLeftInterval = setInterval(() => {
                gameObj.timeForEachRound -= 1000;
                Object.keys(gameObj.players).forEach(playerId => {
                    gameNSP.to(playerId).emit("update-time-left", gameObj.timeForEachRound / 1000);
                })
            }, 1000)
            // start the timer for each round
            await sleep(gameObj.timeForEachRound);

            clearInterval(timeLeftInterval);
            gameObj.ResetTimeLeft();

            // switch the playerId turn to another person.
            gameObj.ChangeToDifferentPlayerId();

            // update game round
            gameObj.currentGameRound += 1;

            // update currentplayerTurn, currentGameRound, restimeleft
            await gameSchema.updateGame(gameSchema.FILTER_QUERIES.filterGame(gameObj.gameId),
                gameSchema.UPDATE_QUERIES.updatePlayerTurn(gameObj.playerTurnId, gameObj.playerTurnIndex));
            await gameSchema.updateGame(gameSchema.FILTER_QUERIES.filterGame(gameObj.gameId),
                gameSchema.UPDATE_QUERIES.updateCurrentGameRound(gameObj.currentGameRound));
            await gameSchema.updateGame(gameSchema.FILTER_QUERIES.filterGame(gameObj.gameId),
                gameSchema.UPDATE_QUERIES.updateTimeForEachRound(gameObj.timeForEachRound));


            console.log(`Round ${roundNum} is over. Player ${gameObj.playerTurnId} turn to draw`);

        }

        console.log('gameOver')
        // Navigate all the users for given gameId to gameOverScreen
        for (const  playerId in gameObj.players) {
            const player = gameObj.players[playerId];
            // emit event to all players that game has started
            gameNSP.to(player.id).emit("navigate-to-gameover-screen")
        }
        

        return "Game should be over now"
    })

}


