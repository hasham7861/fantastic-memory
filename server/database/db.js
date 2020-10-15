const mongoose = require('mongoose');
const dbUri = "mongodb://localhost:27017/fantastic-memory"

function connectToDB() {
    mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
}

module.exports = {
    connectToDB
}
