class Player {
    constructor(id = "", inGame = true, points = 0) {
        this.id = id;
        this.inGame = inGame;
        this.points = points;
    }
}

class GameRound { 
    constructor (wordToGuess = "", playersWithPoints = []){
        wordToGuess = wordToGuess;
        playersWithPoints = playersWithPoints; // store list of players with points
    }
}

const GameStates = ["MENU", "STARTED", "CLOSED"];

class Game {
    constructor(gameObj) {
        if (!gameObj){
            console.log("gameObj is not set");
            return;
        }
        let { gameId , players , status, hostId, playerTurnId, playerTurnIndex, gameRounds, totalRounds, timeForEachRound, currentGameRound } = gameObj;

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
        this.gameRounds = gameRounds ? gameRounds : new Array(3).fill(new GameRound(),0,3); // stores GameRound Objects
        this.currentGameRound = this.currentGameRound ? this.currentGameRound : 1;
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

module.exports.Player = Player;
module.exports.Game = Game;