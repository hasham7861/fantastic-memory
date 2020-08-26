const { Mongoose } = require("mongoose")

const mongoose = require("mongoose")

const gameMapSchema = new mongoose.Schema({
    gameId: String,
    playerIds: Array
})
module.exports = mongoose.model("gamemap", gameMapSchema)



