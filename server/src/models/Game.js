const Player = require("./Player");

const GameStates = ["MENU", "STARTED", "CLOSED"];

module.exports = class Game {
    constructor(gameObj) {
        if (!gameObj){
            console.log("gameObj is not set");
            return;
        }
        let { gameId , players , status, hostId, playerTurnId, playerTurnIndex, gameRounds, totalRounds, timeForEachRound } = gameObj;

        this.gameId = gameId ? gameId : "";
        // cast player objects to player type
        this.players = Object.keys(players).reduce((map, playerId) => {
            map[playerId] = new Player(players[playerId].id, players[playerId].inGame)
            return map;
        }, {});
        this.status = status ? status : GameStates[0];
        this.hostId = hostId ? hostId : ""
        this.playerTurnId = playerTurnId ? playerTurnId : "";
        this.playerTurnIndex = playerTurnIndex ? playerTurnIndex : 0;
        this.gameRounds = gameRounds ? gameRounds : [];
        this.totalRounds = totalRounds ? totalRounds : 3;
        // time is in milliseconds 
        this.timeForEachRound = timeForEachRound ? timeForEachRound : 30000;

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