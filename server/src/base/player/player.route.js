import Express from 'express'

const playerRouter = new Express.Router

class PlayerController {

    // static async setPlayerUsername(req,res){
    //     // store player Username in session
    //     const {username} = req.body
    //     req.session.currentPlayerUsername = username
    //     res.send({success:true})
    // }
}

export default function (app) {

    // playerRouter.post("/set_player_username", PlayerController.setPlayerUsername)

    app.use("/player", playerRouter)
}
