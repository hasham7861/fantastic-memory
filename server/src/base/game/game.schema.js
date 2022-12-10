const mongoose = require("mongoose")
const { pathOr, isEmpty } = require("ramda")

const gameSchema = new mongoose.Schema({
    gameId: { type: String, unique: true, required: true },
    game: { type: Object, required: true },
    createdAt: { type: Date, default: new Date(), expires: 86400 } // expire document after 1 day
})

gameSchema.statics.FILTER_QUERIES = {
    filterGame: (gameId) => {
        return { "gameId": gameId }
    }
}


// return queries based on the object you want to update
gameSchema.statics.UPDATE_QUERIES = {
    updatePlayerTurn: (newPlayerTurnId, newPlayerTurnIndex) => {
        return {
            "$set": {
                "game.playerTurnId": newPlayerTurnId,
                "game.playerTurnIndex": newPlayerTurnIndex
            }
        }
    },
    updateGameRounds: (gameRounds) => {
        return {
            "$set": {
                "game.gameRounds": gameRounds
            }
        }
    },
    updateCurrentGameRound: (currentGameRound) => {
        return {
            "$set": {
                "game.currentGameRound": currentGameRound
            }
        }
    },
    updateTimeForEachRound: (timeForEachRound) => {
        return {
            "$set": {
                "game.timeForEachRound": timeForEachRound
            }
        }
    }
}


gameSchema.statics.doesGameExist = async function (gameId) {
    const doc = await mongoose.model('game').findOne({ "gameId": gameId });
    return doc ? true : false
}

gameSchema.statics.createGame = async function (gameId, game) {
    mongoose.model('game').create({ gameId, game }, function (err) { if (err) console.log(err) });
}

gameSchema.statics.fetchGame = function (gameId) {
    return mongoose.model('game').findOne({ gameId });
}

gameSchema.statics.updateGame = async function (filterQuery, updateQuery) {
    mongoose.model('game').findOneAndUpdate(filterQuery, updateQuery, function (err, doc) {
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
gameSchema.statics.isValidGuessedWordOfRound = async function (gameId, guessedWord) {
    const gameDoc = await mongoose.model('game').findOne({ "gameId": gameId }, function (err, doc) {
        if (err) {
            console.log("unable to record with this gameId");
        }
    })

    const currentRoundObj = gameDoc.game.gameRounds[gameDoc.game.currentGameRound - 1];


    if (currentRoundObj && currentRoundObj.wordToGuess !== undefined) {
        // compare the game round word with input guessed word
        return currentRoundObj.wordToGuess == guessedWord;
    } else {
        return false;
    }


}

// add or remove points from a player in a game
gameSchema.statics.addPointsToPlayer = function (gameId, playerId, points) {

    mongoose.model('game').findOne({ "gameId": gameId }, function (err, doc) {
        if (err) console.log("unable to find player")
        else {

            const playersWithUpdatedPoints = {
                ...doc["game"]["players"]
            }

            playersWithUpdatedPoints[playerId]["points"] += points;

            console.log(playersWithUpdatedPoints)

            mongoose.model('game').findOneAndUpdate({ "gameId": gameId }, { $set: { "game.players": playersWithUpdatedPoints } }, function (err) {
                if (err)
                    console.log('unable to add points')
            });
        }
    })
}


gameSchema.statics.getCurrentRoundPlayers = async function (gameId) {
    if(isEmpty(gameId))
        return
    
    const gameDoc = await mongoose.model('game').findOne({ "gameId": gameId })
    const playersList = pathOr([], ['game','players'])(gameDoc)
    return playersList

}


module.exports = mongoose.model("game", gameSchema)


