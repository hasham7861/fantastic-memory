import EventEmitter from 'events'
import Express from 'express'
import { sleep, isNil, keysIn } from '../../shared/reusable.js'
import { AppError } from '../../shared/errors.js'
import Game from "./game.model.js"
import gameSchema from "./game.schema.js"

const gameEventEmitter = new EventEmitter();
const gameRouter = new Express.Router

class GameController {

    static async getCurrentGameId(req, res) {

        if (isNil(req.session.gameId))
            return res.send({error: "Unable to set current game id"})

        res.send({ gameId: req.session.gameId })
    }
    static async generateGameIdRouteHandler(req, res) {
        const gameId = await Game.getGeneratedGameId()
        req.session.gameId = gameId
        res.send("gameId is set properly")
    }

    static async isGameValidRouteHandler(req, res) {
        const { inputGameId } = req.query

        if (isNil(inputGameId))
            return res.status(400).send("valid_game_id: missing inputGameId query param");

        const canJoinGameResp = await Game.canJoinGame(inputGameId)

        return res.send(canJoinGameResp)
    }

    static async guessWordRouteHandler(req, res) {
        const { gameId, playerId } = req.body;

        if (!gameId ||
            !req.body.guessedWord ||
            !playerId) {
            return res.status(400).send("guessed_word: missing props in body");
        }

        const guessedWord = req.body.guessedWord.toLowerCase()

        const guessedWordMatches = await gameSchema.isValidGuessedWordOfRound(gameId, guessedWord);

        if (guessedWordMatches) {
            await gameSchema.addPointsToPlayer(gameId, playerId, 1);
        }

        res.send({ "wordMatches": guessedWordMatches });
    }

    static async startGameRouteHandler(req, res) {
        /** //FIXME
         * when host of the game, clicks starts game,
         * emit event start game-loop, which starts game loop
         */

        const gameId = req.body.gameId;

        if (!gameId) {
            res.status(400).send("you need a gameId to start game")
            return
        }

        const players = await gameSchema.getCurrentRoundPlayers(gameId)
        const playersTally = keysIn(players).length

        if (playersTally < 2) {
            res.send({ error_message: "game needs more than one player to start game" })
            return
        }

        else {
            gameEventEmitter.emit("start-game", gameId);
            res.send("game has started");
            return
        }
    }

    static async startGameSubscriptionHandler(gameId, gameNSP) {
        //keep track of timer, points, and switch turns here
        /**
         * this should also emit event to all the other players listening in to start game
         * generate a word for player, and keep track of it in game.
         * this game loop starts a timer for 60 seconds, then switch turn to another player
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
            const drawingWord = Game.generateWord();

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
                gameNSP.to(playerId).emit("load-players-list", { "players": playersList, "currentPlayerId": currentPlayerTurnId })

                // this should reset all canvas on start of gameround
                gameNSP.to(playerId).emit("draw-on-canvas", { lines: [] })


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
        for (const playerId in gameObj.players) {
            const player = gameObj.players[playerId];
            // emit event to all players that game has started
            gameNSP.to(player.id).emit("navigate-to-gameover-screen")
        }

        return "Game should be over now"
    }
}

export default function (webSocketIo, app) {

    const gameNSP = webSocketIo.of("/game-nsp");

    gameRouter.get("/get_current_game_id", GameController.getCurrentGameId)

    gameRouter.get("/generate_game_id", GameController.generateGameIdRouteHandler)

    gameRouter.get("/is_valid_game_id", GameController.isGameValidRouteHandler)

    gameRouter.post("/guess_word", GameController.guessWordRouteHandler)

    gameRouter.post("/start_game", GameController.startGameRouteHandler)

    gameEventEmitter.on("start-game", async (gameId) => GameController.startGameSubscriptionHandler(gameId, gameNSP))


    app.use("/game", gameRouter)
}
