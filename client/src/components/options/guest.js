import React, {useState} from 'react';

export default function () {
    
    const [inputGameId, setInputGameId] = useState("");
    return (
        <div>
            <p>Sup Guest</p>
            <p>To join a game please enter in gameId</p>
            <input type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={(e)=>setInputGameId(e.target.value)}/>
            <button onClick={()=>console.log(inputGameId)}>Join Game</button>
        </div>
    )
}