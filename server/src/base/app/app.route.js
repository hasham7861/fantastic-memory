import GameRoutes from '../game/game.route.js'

export default function (webSocketIo, app) {

    // main app routes
    app.get("/api", (req, res) => {
      res.send({
        "message": "Api is working",
        "status": 200
      });
    });
  
    // all other apis here
    GameRoutes(webSocketIo, app)
    
  
    app.use((req, res) => {
      res.status(404).send({
        message: "Not Found",
        status: 404
      });
    });
  
  
  }