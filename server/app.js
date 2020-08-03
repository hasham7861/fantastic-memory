const app = require('express')()
const crypto = require('crypto')
const {currentGamesMap} = require('./webchat');
const { query } = require('express');

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

app.get("/game/is_valid_game_id", (req,res)=>{
  if(!req.query.inputGameId) 
    return res.status(400).send("valid_game_id: missing inputGameId query param")
  
  if(!currentGamesMap)
    return res.status(403).send("valid_game_id: there isn't any games going on")
  
  let inputGameId = req.query.inputGameId.slice(0,8);
  
  if(inputGameId in currentGamesMap){  
    res.send({game_id_valid:true})
  }else{
    res.send({game_id_valid:false})
  }
  
  })
module.exports = app;