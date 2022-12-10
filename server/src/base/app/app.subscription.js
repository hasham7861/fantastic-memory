const { initializeGameNSP } = require("../game/game.subscription");

function initializeWebSocketNameSpaces(webSocketIo) {

    initializeGameNSP(webSocketIo);
    webSocketIo.on("connection", socket => {
        // generic io events 
    })
}

module.exports = {
    initializeWebSocketNameSpaces
}