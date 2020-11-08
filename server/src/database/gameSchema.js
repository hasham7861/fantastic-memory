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
    mongoose.model('game').findOneAndUpdate({"gameId":gameId}, updatedGameObj, function(err){
        if(err)
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

// gameSchema.statics.removePlayersNotInGame = function (gameId) {
//     mongoose.model('game').findOne({ "gameId": gameId }, function (err, doc) {
//         if (err)
//             console.log("unable to remove players not In game");
//         if (doc) {

//             for (let playerId in doc.game.players) {
//                 if (doc.game.players[playerId].inGame === false) {
//                     delete doc.game.players[playerId]
//                 }
//             }
//             mongoose.model('game').findOneAndUpdate({ _id: new ObjectId(doc._id) }, { "$set": { "game.players": doc.game.players } }, function () { console.log("should have removed players") })
//         }
//     })
// }


gameSchema.statics.removePlayerFromGame = function (gameId, playerId) {
    console.log('game.players.' + playerId)
    mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, { "$unset": { ['game.players.' + playerId]: 1 } }, function (err) {
        if (err)
            console.log("unable to remove player from game");
    })
}


module.exports = mongoose.model("game", gameSchema)



