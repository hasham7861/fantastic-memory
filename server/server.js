// node modules
const express = require("express");

// load up server and frontend module
const app = require('./app');
const PORT = process.env.PORT | "5000";
// server
const server = express();
server.use(express.json());

// Settings for the entire server
const allowedOrigins = ['http://localhost:3000',
  'http://localhost:5000'];
server.use((req, res, next) => {
  allowedOrigins.forEach(origin =>
    res.header("Access-Control-Allow-Origin", origin))

});

server.use(app);

server.use((req, res) => {
  res.status(404).send({
    message: "Not Found",
    status: 404
  });
});

server.listen(PORT, (err) => {
  if (err) throw err
  console.log('> Listening in on Port:', PORT)
})

module.exports = server;

