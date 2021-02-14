const mongoose = require('mongoose');
const dbUri = "mongodb://localhost:27017/fantastic-memory"

function connectToDB() {
    const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false };
    mongoose.connect(dbUri, connectionOptions)
            .then(_=>
                    console.log('database connected'))
            .catch(err=>console.log(err.message))
}

module.exports = {
    connectToDB
}
