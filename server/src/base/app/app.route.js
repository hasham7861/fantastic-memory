module.exports = function (webSocketIo, app) {

    // main app routes
    app.get("/api", (req, res) => {
      res.send({
        "message": "Api is working",
        "status": 200
      });
    });
  
    // all other apis here
    require('../game/game.route')(webSocketIo, app)
    
  
    app.use((req, res) => {
      res.status(404).send({
        message: "Not Found",
        status: 404
      });
    });
  
  
  }