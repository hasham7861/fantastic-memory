import axios from 'axios';
import { envUri } from './environment';

const isServerUp = async (cb) => {
    return axios.get(envUri + "/api").then(data => cb()).catch(err => console.log("server_status: down"))
}

const getGameToken = async () => {
    return axios.get(envUri + "/game/generate_game_id").then(data => data).catch(err => {
        return null
    })
};

const isValidGameId = async (gameId) => {
    return axios.get(envUri + "/game/is_valid_game_id?inputGameId=" + gameId).then(data => data).catch(err => null)
}

export {
    isServerUp,
    getGameToken,
    isValidGameId
}