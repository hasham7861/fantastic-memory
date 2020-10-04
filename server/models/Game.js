module.exports = class Game {
    constructor(id, players, status, hostId, playerTurnId) {
        this.id = id ? id : "";
        this.players = players ? players : 
        [
            // new Player(playerId1)
        ];
        this.status = status ? status : "not-started";
        this.hostId = hostId ? hostId : "";
        this.playerTurnId = playerTurnId ? playerTurnId : "";
        this.gameRounds = [
            // { wordGenerated: "", playersScore: {player1:2,player2:0} }
        ]

    }
}