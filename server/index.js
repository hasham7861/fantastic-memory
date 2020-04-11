const server = require('express')();

server.get("/api", (req, res) => {
  res.send("fantastic server is working");
});

module.exports = server;