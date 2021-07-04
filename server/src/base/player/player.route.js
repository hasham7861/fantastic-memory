import Express from 'express'
import {isNil} from '../../shared/reusable.js'

const playerRouter = new Express.Router

class PlayerController {

    static async getPlayerUsername(req,res){
        // get player Username from session
        if (isNil(req.session.username))
            return res.send({error: "Unable to get current username"})

        res.send({ username: req.session.username })
    }
}

export default function (app) {

    playerRouter.get("/get_current_username", PlayerController.getPlayerUsername)

    app.use("/player", playerRouter)

}
