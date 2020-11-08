const mongoose = require("mongoose")
const ObjectId = mongoose.ObjectId;

const playerToGameSchema = new mongoose.Schema({
    playerId: { type: String, unique: true, required: true },
    gameId: { type: String, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})


playerToGameSchema.statics.createPlayer = function (playerId, gameId) {
    mongoose.model('playerToGame').findOneAndUpdate({ playerId }, { playerId, gameId }, { upsert: true }, function (err) { if (err) console.log(err) });
}


playerToGameSchema.statics.fetchPlayer = function (playerId) {
    return mongoose.model('playerToGame').findOne({ "playerId": playerId })
}

playerToGameSchema.statics.removePlayersFromGame = function (gameId) {
    mongoose.model('playerToGame').deleteMany({ "gameId": gameId }, function (err) { if (err) console.log(err) });
}

// returns the playerDoc upon deletion
playerToGameSchema.statics.removePlayerFromGame = function (playerId) {

    // console.log(playerId)
    mongoose.model('playerToGame').findOneAndRemove({ "playerId": playerId }, function (err) { if (err) console.log('unable to find player') })
}



module.exports = mongoose.model("playerToGame", playerToGameSchema)



