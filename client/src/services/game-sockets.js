import io from 'socket.io-client';
import { envUri } from './environment';
import { isServerUp } from './rest';

const initiateGameSockets = isServerUp(() => {
    const mySocket = io(envUri)
    mySocket.on('connect', function () { });
    mySocket.on('event', function (data) { });
    mySocket.on('disconnect', function () { });
    return "intiated all socket"
})

export {
    initiateGameSockets
}