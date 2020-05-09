
const app = require('express')();

const io = require('socket.io').listen(app);

io.on('connection',(socket)=>{
  console.log(`new user with sockid:${socket}`)
  socket.emit("event", "kidddo")
 
})

io.on('potato',(socket)=>{
  // io.emit('connect',"hello kidddo")
  console.log(`new user with sockid:${socket.id}`)
})
app.get("/api", (req, res) => {
  res.send({
    "message": "Api is working",
    "status": 200
  });
});

module.exports = app;