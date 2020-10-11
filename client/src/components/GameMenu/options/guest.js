import React, { useState, useEffect, useRef, useContext } from 'react';
import { joinGame, mySocket } from '../../services/game-sockets';
import { withRouter } from 'react-router-dom'
import { isValidGameId } from '../../services/rest'
import './guest.css'

import { AppContext } from '../../App'
function Guest(props) {

    const [inputGameId, setInputGameId] = useState("");
    const joinGameDiv = useRef(null)
    const waitingDiv = useRef(null)
    const invalidGameIdDiv = useRef(null)

    const { setPlayerId } = useContext(AppContext)

    const joinLobby = () => {
        // join game if use enters a valid id
        if (inputGameId.length > 1) {
            isValidGameId(inputGameId).then(resp => {
                let isGameIdValid = resp.data.game_id_valid
                if (isGameIdValid === true) {
                    joinGameDiv.current.style.display = "none"
                    waitingDiv.current.style.display = "block"
                    invalidGameIdDiv.current.style.display = "none"
                    joinGame(inputGameId)
                } else if (isGameIdValid === false) {
                    invalidGameIdDiv.current.style.display = "block"

                }
            })
        }

    }

    useEffect(() => {
        mySocket.emit("get-id")
        mySocket.on("player-id", function (id) {
            setPlayerId(id)
        })

        mySocket.on("start-game", (data) => {
            //change the page to start-game with your socid to refer back to and gameId
            props.history.push({ pathname: "/start-game", state: data })
        })

    }, [props.history, setPlayerId])

    return (

        <div id="guest">
            <p id="title">Sup Guest</p>
            <div ref={joinGameDiv}>
                <p>To join a game please enter in gameId</p>
                <input type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={(e) => setInputGameId(e.target.value)} />
                <button onClick={joinLobby}>Join Game</button>
                <div ref={invalidGameIdDiv} style={{ display: "none", color: "red" }}>
                    <p>Please enter in a valid gameid</p>
                </div>
            </div>
            <div ref={waitingDiv} style={{ display: "none" }}>
                <p >Waiting on host to start the game</p>
            </div>
            {/* {appContext} */}
        </div>

    )
}

export default withRouter(Guest)