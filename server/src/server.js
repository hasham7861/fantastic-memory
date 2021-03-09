import express from 'express'
import http from 'http'
import cors from 'cors'
import webSocket from 'socket.io'

import { connectToDB } from './shared/mongoDB.js'
import initAppRoutes from './base/app/app.route.js'
import { initializeWebSocketNameSpaces } from './base/app/app.subscription.js'

import env from './env.js'

class Server {

  /**
   * @method _setupAndRetrieveExpressApp
   * @description setup the express midleware
   * @returns {ExpressApp} app
   */
  static async _setupAndRetrieveExpressApp() {

    const corsOptions = {
      orgins: env.AllowedOrigins,
      optionSuccessStatus: 200
    }
    const app = express();
    app.use(express.json());
    app.use(cors(corsOptions));
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

    server.listen(env.PORT);

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

export default Server.start

