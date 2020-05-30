import React, { useState, useEffect } from 'react';
import {getGameToken } from '../../services/rest';
import { initiateGameSockets } from '../../services/game-sockets';

export default function () {
    const [gameId, setGameId] = useState("");
    initiateGameSockets.then(data=>console.log(data));
    
    useEffect(() => {
        if (!gameId) {
            getGameToken().then(data => {
                console.log(data.data.gameId);
                setGameId(data.data.gameId)
            })
        }
        
    })

    return (
    <div>Hey there Host, share the following gameid: <b>{gameId}</b> with your guests
    </div>
    )
}