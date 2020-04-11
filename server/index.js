const server = require('express')();

server.get("/api", (req, res) => {
  res.send({
    "message":"Api is working",
    "status":200
  });
});

module.exports = server;