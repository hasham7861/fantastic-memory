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

class Server {

  /**
   * @method _setupAndRetrieveExpressApp
   * @description setup the express midleware
   * @returns {ExpressApp} app
   */
  static async _setupAndRetrieveExpressApp() {

    const app = express()

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
    app.use(session({
      secret: conf.SESSION_CONF.SECRET,
      saveUninitialized: false,
      resave: false,
      store: SessionStore({
        uri: conf.DbDevUri,
        collection: 'sessions'
      })
    }))
  
    return app;
  }

  /**
   * @method _initServer
   * @description setup the main http server
   * @returns {void}
   */
  static async _initServer() {
    const app = await this._setupAndRetrieveExpressApp();

    const server = http.createServer(app);

    // connect to mongo db
    connectToDB()

    // enabling websocket protocol
    const webSocketIo = webSocket(server);
    initializeWebSocketNameSpaces(webSocketIo);

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

