// node modules
const express = require("express");

// load up server and frontend module
const app = require('./apis/app');
const { intializeWSEvents } = require('./socket-events/webchat');
const PORT = process.env.PORT | "5000";

// server
const server = express();
server.use(express.json());
const http = require('http').createServer(server);
const io = require('socket.io')(http);

// // intialize all the WS events
intializeWSEvents(io);


// Settings for the entire server

server.use((req, res, next) => {
  let allowedOrigins = ['http://localhost:3000',
    'http://localhost:5000'];
  let origin = req.headers.origin;
  if (allowedOrigins.indexOf(origin) > -1) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // res.header('Access-Control-Allow-Credentials', true);
  return next();
});

// // make use of all the
server.use(app);


server.use((req, res) => {
  res.status(404).send({
    message: "Not Found",
    status: 404
  });
});

http.listen(PORT, (err) => {
  if (err) throw err
  console.log('> Listening in on Port:', PORT)
})

module.exports = server;
