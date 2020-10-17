const app = require('express')()
// const game = require('./game');

// main app routes
app.get("/api", (req, res) => {
  res.send({
    "message": "Api is working",
    "status": 200
  });
});


// intialize other routes here
// app.use("/game", game)



module.exports = app;