const Player = require("./Player");

const GameStates = ["MENU", "STARTED", "CLOSED"]
module.exports = class Game {
    constructor({ gameId = "", players = {}, status = GameStates[0], hostId = "", playerTurnId = "",
        playerTurnIndex = 0, gameRounds = [], totalRounds = 3, timeForEachRound = 30000 }) {
        this.gameId = gameId;
        // cast player objects to player type
        this.players = Object.keys(players).reduce((map, playerId)=>{
            map[playerId] = new Player(players[playerId].id, players[playerId].inGame)
            return map;
        },{});
        this.status = status;
        this.hostId = hostId;
        this.playerTurnId = playerTurnId;
        this.playerTurnIndex = playerTurnIndex;
        this.gameRounds = gameRounds;
        this.totalRounds = totalRounds;
        // time is in milliseconds 
        this.timeForEachRound = timeForEachRound;

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
        this.timeForEachRound = 30000;
    }
}