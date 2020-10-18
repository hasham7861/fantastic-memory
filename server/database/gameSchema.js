const mongoose = require("mongoose");
const playerToGameSchema = require("./playerToGameSchema");

const gameSchema = new mongoose.Schema({
    gameId: { type: String, unique: true, required: true },
    game: { type: Object, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})

gameSchema.statics.createGame = async function (gameId, game) {
    mongoose.model('game').create({ gameId, game }, function (err) { if (err) console.log(err) });
}

gameSchema.statics.fetchGame = function (gameId) {
    return mongoose.model('game').findOne({ gameId });
}

gameSchema.statics.removeGame = function (gameId) {
    mongoose.model('game').deleteOne({ "gameId": gameId }, function (err) { if (err) { console.log(err) } });
}

gameSchema.statics.removePlayerFromGame = function (gameId, playerId) {
    mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, { "$unset": { ['game.players.' + playerId]: 1 } }, function (err) {
        if (err)
            console.log("unable to remove player from game");
    })
}


module.exports = mongoose.model("game", gameSchema)



