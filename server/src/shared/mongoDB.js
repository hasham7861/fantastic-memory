import mongoose from 'mongoose'
import conf from '../../config.js'
const dbUri = conf.DbDevUri

export function connectToDB() {
    const connectionOptions = { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false };
    mongoose.connect(dbUri, connectionOptions)
            .then(_=>
                    console.log('database connected'))
            .catch(err=>console.log(err.message))
}