import express from 'express'
import http from 'http'
import cors from 'cors'
import webSocket from 'socket.io'

import { connectToDB } from './shared/mongoDB.js'
import initAppRoutes from './base/app/app.route.js'
import { initializeWebSocketNameSpaces } from './base/app/app.subscription.js'
import conf from './config.js'
import session from "express-session"
import MongodbSession from 'connect-mongodb-session'
import sharedSession from 'express-socket.io-session'
class Server {

  /**
   * @method _initServer
   * @description setup the main http server
   * @returns {void}
   */
  static async _initServer() {

    const app = await express()
    const corsOptions = {
      origin: conf.AllowedOrigins,
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 204,    
      credentials: true
    }
    app.use(cors(corsOptions))

    app.use(express.json())

    const SessionStore = MongodbSession(session)
    const sessionMiddleware = session({
      secret: conf.SESSION_CONF.SECRET,
      saveUninitialized: false,
      resave: false,
      store: SessionStore({
        uri: conf.DbDevUri,
        collection: 'sessions',
        ttl: 600 // should auto expire session after 10 mins
      })
    })
    app.use(sessionMiddleware)


    const server = http.createServer(app);

    // connect to mongo db
    connectToDB()

    // enabling websocket protocol
    const webSocketIo = webSocket(server);
    webSocketIo.use(sharedSession(sessionMiddleware,{
      autoSave: true
    }))

    initializeWebSocketNameSpaces(webSocketIo, sessionMiddleware);

    //giving websocket protocol access to express app
    initAppRoutes(webSocketIo, app);

    server.listen(conf.PORT);

  }

  /**
   * @method start
   * @description start the server
   * @returns {void}
   */
  static async start() {
    this._initServer();
  }
}

(() => {
  Server.start()
})()
export default {}

