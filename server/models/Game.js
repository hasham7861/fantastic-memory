
const GameStates = ["MENU", "STARTED", "CLOSED"]
module.exports = class Game {
    constructor(id, players, status, hostId, playerTurnId) {
        this.id = id ? id : "";
        this.players = players ? players :
            {
                // playerID:  new Player(playerId1)
            };
        this.status = status ? status : GameStates[0];
        this.hostId = hostId ? hostId : "";
        this.playerTurnId = playerTurnId ? playerTurnId : "";
        this.playerTurnIndex = 0
        this.gameRounds = [
            // { wordGenerated: "", playersScore: {player1:2,player2:0} }
        ]

    }

    ChangeToDifferentPlayerId() {
        if ((this.playerTurnIndex + 1) > this.players.length - 1) {
            this.playerTurnIndex = 0;
        } else {
            this.playerTurnIndex = this.playerTurnIndex + 1
        }
        this.playerTurnId = this.players[this.playerTurnIndex]
    }
}