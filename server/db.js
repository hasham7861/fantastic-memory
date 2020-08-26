const mongoose = require('mongoose');
const DBURI = "mongodb://localhost:27017/fantastic-memory"
const gamemap_col = require("./gamemap_collection");

function connectToDB() {
    mongoose.connect(DBURI, { useNewUrlParser: true, useUnifiedTopology: true })
}

function getGameMap(){
    gamemap_col.find({},(data)=>{
        console.log(data)
    })
}
connectToDB()
getGameMap()
module.exports = {
   connectToDB
}
