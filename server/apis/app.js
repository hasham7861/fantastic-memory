const app = require('express')()


// main app routes
app.get("/api", (req, res) => {
  res.send({
    "message": "Api is working",
    "status": 200
  });
});

// intialize other routes here
app.use("/game", require('./game'))

module.exports = app;