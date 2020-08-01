import React, { useState, useRef } from 'react';
import { joinGame } from '../../services/game-sockets';
import './guest.css'
export default function () {

    const [inputGameId, setInputGameId] = useState("");
    const joinGameDiv = useRef(null)
    const waitingDiv = useRef(null)

    const joinLobby = () => {
        joinGame(inputGameId)
        if (inputGameId.length > 0) {
            joinGameDiv.current.style.display = "none"
            waitingDiv.current.style.display = "block"
        }

    }

    return (
        <div id="guest">
            <p id="title">Sup Guest</p>
            <div ref={joinGameDiv}>
                <p>To join a game please enter in gameId</p>
                <input type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={(e) => setInputGameId(e.target.value)} />
                <button onClick={joinLobby}>Join Game</button>
            </div>
            <div ref={waitingDiv} style={{ display: "none" }}>
                <p >Waiting on host to start the game</p>
            </div>
        </div>
    )
}

