const mongoose = require("mongoose");
const ObjectId = mongoose.ObjectId;

const gameSchema = new mongoose.Schema({
    gameId: { type: String, unique: true, required: true },
    game: { type: Object, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})

gameSchema.statics.doesGameExist = async function (gameId) {
    let doc = await mongoose.model('game').findOne({ "gameId": gameId });
    return doc ? true : false
}

gameSchema.statics.createGame = async function (gameId, game) {
    mongoose.model('game').create({ gameId, game }, function (err) { if (err) console.log(err) });
}

gameSchema.statics.fetchGame = function (gameId) {
    return mongoose.model('game').findOne({ gameId });
}

gameSchema.statics.updateGame = function (gameId, updatedGameObj) {
    mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, updatedGameObj, function (err) {
        if (err)
            console.log("unable to update game obj")
    })
}

gameSchema.statics.removeGame = function (gameId) {
    mongoose.model('game').deleteOne({ "gameId": gameId }, function (err) { if (err) { console.log(err) } });
}

gameSchema.statics.setPlayerNotInGame = function (gameId, playerId) {
    mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, { "$set": { ['game.players.' + playerId + ".inGame"]: false } }, function (err) {
        if (err)
            console.log("unable to remove player from game");
    })
}

gameSchema.statics.removePlayerFromGame = function (gameId, playerId) {
    mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, { "$unset": { ['game.players.' + playerId]: 1 } }, function (err) {
        if (err)
            console.log("unable to remove player from game");
    })
}

// return true when the input word matches the game round wort To guess
gameSchema.statics.isValidGuessedWordOfRound = function (gameId, guessedWord, roundNum) {
    return mongoose.model('game').findOne({ "gameId": gameId }, function (err, doc) {
        if (err) {
            console.log("unable to record with this gameId");
            return;
        }
        // compare the game round word with input guessed word
        return doc.game.gameRounds[roundNum - 1].guessedWord == guessedWord;
    })
}

// add or remove points from a player in a game
gameSchema.statics.addPointsToPlayer = function (gameId, playerId, points) {
    mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, { "$inc": { ['game.players.' + playerId + "points"]: points } }, function (err) {
        if (err) console.log("unable to add points to a player in game")
    })
}


module.exports = mongoose.model("game", gameSchema)



