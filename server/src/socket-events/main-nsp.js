const { initializeGameNSP } = require("./game-nsp");

function initializeWebSocketNameSpaces(webSocketIo) {

    initializeGameNSP(webSocketIo);
    webSocketIo.on("connection", socket => {
        // generic io events 
    })
}

module.exports = {
    initializeWebSocketNameSpaces
}