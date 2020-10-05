module.exports = class Player {
    constructor(id, inGame) {
        this.id = id ? id : "";
        this.inGame = inGame ? inGame : true
    }
}