import crypto from 'crypto'
import { isEmpty, isNil, keysIn } from 'ramda'
import gameSchema from './game.schema.js'
import Player from '../player/player.model.js'
import GameRound from './gameround/gameround.model.js'
import { words } from "./scaffold_data/category_of_words.js"

const GameStates = ["MENU", "STARTED", "CLOSED"];

export default class Game {
    constructor(gameObj) {
        if (!gameObj) {
            console.log("gameObj is not set");
            return;
        }
        const { gameId, players, status, hostId, playerTurnId, playerTurnIndex, gameRounds, totalRounds, timeForEachRound, currentGameRound } = gameObj;

        this.gameId = gameId ? gameId : "";
        // cast player objects to player type
        this.players = Object.keys(players).reduce((map, playerId) => {
            map[playerId] = new Player(players[playerId].id, players[playerId].inGame, players[playerId].points)
            return map;
        }, {});
        this.status = status ? status : GameStates[0];
        this.hostId = hostId ? hostId : ""
        this.playerTurnId = playerTurnId ? playerTurnId : "";
        this.playerTurnIndex = playerTurnIndex ? playerTurnIndex : 0;
        this.gameRounds = gameRounds ? gameRounds : new Array(3).fill(new GameRound(), 0, 3); // stores GameRound Objects
        this.currentGameRound = this.currentGameRound ? this.currentGameRound : 1;
        this.totalRounds = totalRounds ? totalRounds : 3;
        // time is in milliseconds 
        this.timeForEachRound = timeForEachRound ? timeForEachRound : 60000;

    }

    ChangeToDifferentPlayerId() {
        if ((this.playerTurnIndex + 1) > Object.keys(this.players).length - 1) {
            this.playerTurnIndex = 0;
        } else {
            this.playerTurnIndex = this.playerTurnIndex + 1
        }

        this.playerTurnId = Object.keys(this.players)[this.playerTurnIndex];
    }

    AddPlayerToGame(playerId) {
        if (!(playerId in this.players)) {
            this.players[playerId] = new Player(playerId);
        }
    }

    ResetTimeLeft() {
        this.timeForEachRound = 60000;
    }

    static async getGeneratedGameId() {
        const gameIdBuffer = await crypto.randomBytes(4)
        const gameId = gameIdBuffer.toString('hex')

        return gameId;
    }

    static isValidGame(inputGameId) {
        return inputGameId.length === 8
    }

    static async canJoinGame(gameId) {
        const inputGameId = gameId.slice(0, 8);
        const gameDoc = await gameSchema.fetchGame(inputGameId)
        const gameExists = !isNil(gameDoc.game) || !isEmpty(gameDoc.game);
        if (!gameExists) {
            return { game_id_valid: false, error_message: "gameId is invalid" }
        }
        const playersExist = !isEmpty(gameDoc.game.players)

        if (playersExist) {
            const gameLobbyPlayerLimit = 3
            if (keysIn(gameDoc.game.players).length >= gameLobbyPlayerLimit)
                return { game_id_valid: false, error_message: "max 3 players allowed in lobby" }
        }

        return { game_id_valid: true, error_message: "" }
    }

    static generateWord() {
        const randomNumIndex = Math.floor(Math.random() * words.length)
        return words[randomNumIndex]
    }
}