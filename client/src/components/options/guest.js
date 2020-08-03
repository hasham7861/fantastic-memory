import React, { useState, useEffect, useRef } from 'react';
import { joinGame, mySocket } from '../../services/game-sockets';
import {withRouter} from 'react-router-dom' 
import { isValidGameId } from '../../services/rest'
import './guest.css'
function Guest (props) {

    const [inputGameId, setInputGameId] = useState("");
    const joinGameDiv = useRef(null)
    const waitingDiv = useRef(null)
    const invalidGameIdDiv = useRef(null)

    const joinLobby = () => {
        // join game if use enters a valid id
        if (inputGameId.length >1 ) {
            isValidGameId(inputGameId).then(resp => {
                let isGameIdValid = resp.data.game_id_valid
                if(isGameIdValid == true){
                    joinGameDiv.current.style.display = "none"
                    waitingDiv.current.style.display = "block"
                    invalidGameIdDiv.current.style.display="none"
                    joinGame(inputGameId)
                }else if(isGameIdValid == false){
                    invalidGameIdDiv.current.style.display="block"
                   
                }
            })
        }

    }

    useEffect(() => {
        mySocket.on("start-game",(data)=>{
            //change the page to start-game with your socid to refer back to and gameId
            console.log(data)
            props.history.push({ pathname: "/start-game", state: data })
        })
       
    }, [])

    return (
        <div id="guest">
            <p id="title">Sup Guest</p>
            <div ref={joinGameDiv}>
                <p>To join a game please enter in gameId</p>
                <input type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={(e) => setInputGameId(e.target.value)} />
                <button onClick={joinLobby}>Join Game</button>
                <div ref={invalidGameIdDiv} style={{ display: "none", color:"red" }}>
                    <p>Please enter in a valid gameid</p>
                </div>
            </div>
            <div ref={waitingDiv} style={{ display: "none" }}>
                <p >Waiting on host to start the game</p>
            </div>

        </div>
    )
}

export default withRouter(Guest)