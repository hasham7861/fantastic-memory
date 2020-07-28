import React, {useState} from 'react';
import {joinGame} from '../../services/game-sockets';

export default function () {
    
    const [inputGameId, setInputGameId] = useState("");

    const joinLobby = () =>{
        joinGame(inputGameId)
    }

    return (
        <div>
            <p>Sup Guest</p>
            <p>To join a game please enter in gameId</p>
            <input type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={(e)=>setInputGameId(e.target.value)}/>
            <button onClick={joinLobby}>Join Game</button>
        </div>
    )
}