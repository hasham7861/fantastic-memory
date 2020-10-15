const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    gameId: { type: String, unique: true, required: true },
    game: { type: Object, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})

// make create game method
gameSchema.methods.createGame = function (gameId, game) {
    mongoose.model('game').create({ gameId, game })
}

gameSchema.methods.fetchGame = function (gameId) {
    return mongoose.model('game').find({ gameId })
}

// TODO Add player to game
gameSchema.methods.addPlayerToGame = function (gameId, playerId){

}


module.exports = mongoose.model("game", gameSchema)



