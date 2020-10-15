const mongoose = require("mongoose")

const playerToGameSchema = new mongoose.Schema({
    playerId: { type: String, unique: true, required: true },
    gameId: { type: String, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})

playerToGameSchema.methods.createPlayer = function (playerId, gameId) {
    mongoose.model('playerToGame').create({ playerId, gameId })
}

playerToGameSchema.methods.fetchPlayer = function (playerId) {
    return mongoose.model('playerToGame').find({ playerId })
}

module.exports = mongoose.model("playerToGame", playerToGameSchema)



