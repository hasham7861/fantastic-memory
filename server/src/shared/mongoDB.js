const mongoose = require('mongoose');
const config = require('../env.json')
const dbUri = config.MongoDbUri;

async function connectToDB() {
    const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false };
    try {
        console.log('Attempting to connect to DB...')
        await mongoose.connect(dbUri, connectionOptions)
        console.log('MongoDB is setup and connected');
    } catch (error) {
        console.log(`MongoDB failed to connect with error '${JSON.stringify(error)}'`)
    }
}

module.exports = {
    connectToDB
}
