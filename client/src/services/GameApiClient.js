import conf from './config.dev'
import {isNil} from '../common/helpers/es6-helpers'

export default class GameApiClient {

    // relative route, and fetch request options
    static request(route, body){

        const url = conf.GAME_API_BASE_URL + route

        if(isNil(body)){
            return fetch(url, {
                method: 'GET',
                credentials: 'include'
            })
        }else {
            return fetch(url, {
                method: 'POST',
                credentials: 'include',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            })
        }
    }

    static async isServerUp(cb){
        return this.request("/api").then(()=>cb()).catch(() => console.log("server_status: down"))
    }

    static async isValidGameId (gameId){
        return this.request("/game/is_valid_game_id?inputGameId=" + gameId)
    }
}