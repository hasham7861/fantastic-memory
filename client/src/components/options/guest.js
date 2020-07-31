import React, {useState} from 'react';
import {joinGame} from '../../services/game-sockets';
import './guest.css'
export default function () {
    
    const [inputGameId, setInputGameId] = useState("");

    const joinLobby = () =>{
        joinGame(inputGameId)

    }

    return (
        <div id="guest">
            <p id="title">Sup Guest</p>
            <p>To join a game please enter in gameId</p>
            <input type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={(e)=>setInputGameId(e.target.value)}/>
            <button onClick={joinLobby}>Join Game</button>
        </div>
    )
}

const WaitingToJoin = function (){
    // TODO: listen for the event to 
}