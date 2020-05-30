import io from 'socket.io-client';
import axios from 'axios';


const isServerUp = async (cb) => {
    return axios.get(envUri + "/api").then(data => cb()).catch(err => console.log("server_status: down"))
}

const devUri = "http://localhost:5000";
const envUri = devUri;

module.exports = {
    isServerUp,
    envUri
}