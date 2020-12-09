// node modules
const express = require("express");
const http = require('http');
const cors = require('cors');

const env = require("./env.json");
const { connectToDB } = require("./database/db");
const webSocket = require('socket.io');
const initAppRoutes = require('./apis/app-routes');
const { initializeWebSocketNameSpaces } = require('./socket-events/main-nsp');


class Server {

  /**
   * @method _initApp
   * @description setup the express midleware
   * @returns {ExpressApp} app
   */
  static async _initApp() {

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
    const app = await this._initApp();
    const server = http.createServer(app);
    // connect to mongo db
    connectToDB()
    // enabling websocket protocol
    const webSocketIo = webSocket(server);
    initializeWebSocketNameSpaces(webSocketIo);
    //linking express middlware with http server
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

Server.start()

