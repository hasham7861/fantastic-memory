import React, { useState, useEffect } from 'react';
import { getGameToken } from '../../services/rest';
import { createGame } from '../../services/game-sockets'

export default function () {
    const [gameId, setGameId] = useState("");

    useEffect(() => {
        if (!gameId) {
            getGameToken().then(data => {
                console.log(data.data.gameId);
                setGameId(data.data.gameId);
                createGame(data.data.gameId)
            })
            
        }

    })

    return (
        <div>Hey there Host, share the following gameid: <b>{gameId}</b> with your guests
        </div>
    )
}