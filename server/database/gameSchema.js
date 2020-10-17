const mongoose = require("mongoose")

const gameSchema = new mongoose.Schema({
    gameId: { type: String, unique: true, required: true },
    game: { type: Object, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})

gameSchema.statics.createGame = function (gameId, game) {
    mongoose.model('game').create({ gameId, game })
}

gameSchema.statics.fetchGame = function (gameId) {
    return mongoose.model('game').findOne({ gameId })
}


module.exports = mongoose.model("game", gameSchema)



