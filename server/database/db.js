const mongoose = require('mongoose');
const DBURI = "mongodb://localhost:27017/fantastic-memory"
const gamemap_col = require("./gamemap_collection");

function connectToDB() {
    mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
}

async function getGameMap() {
    gamemap_col.find({}, (err, data) => {
        if (err)
            console.log("db-error:", err)

        console.log(data)
    })
}

module.exports = {
    connectToDB,
    getGameMap
}
