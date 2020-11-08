const app = require('express')();

module.exports = function (webSocketIo) {
 
  // main app routes
  app.get("/api", (req, res) => {
    res.send({
      "message": "Api is working",
      "status": 200
    });
  });

  // all other apis here
  app.use("/game", require('./game-routes')(webSocketIo));

  return app;

}