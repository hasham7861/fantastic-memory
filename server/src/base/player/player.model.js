module.exports = class Player {
    constructor(id = "", inGame = true, points = 0) {
        this.id = id;
        this.inGame = inGame;
        this.points = points;
    }
}