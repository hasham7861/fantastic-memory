const app = require('express')();
const crypto = require('crypto');

app.get("/api", (req, res) => {
  res.send({
    "message": "Api is working",
    "status": 200
  });
});

app.get("/game/generate_game_id", (req, res) => {
  crypto.randomBytes(4, function (err, buffer) {
    if (err)
      res.status(404).send("generate_game_token err: unable to generate random game token");
    res.send({ gameId: buffer.toString('hex') });
  });
})
module.exports = app;