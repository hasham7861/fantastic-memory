import React, { useState, useEffect } from 'react';
import { getGameToken } from '../../services/rest';
import { createGame, getListOfAllPlayers } from '../../services/game-sockets'

export default function () {
    const [gameId, setGameId] = useState("");

    useEffect(() => {
        if (!gameId) {
            getGameToken().then(data => {
                const gameId = data.data.gameId
                if(!gameId)
                    return;
                console.log(gameId);
                setGameId(gameId);
                createGame(gameId);
                // TODO list of players not being retrieved
                getListOfAllPlayers(gameId).then(listOfPlayers=>{
                    console.log(listOfPlayers)
                })
            })
            
        }

    })

    return (
        <div>Hey there Host, share the following gameid: <b>{gameId}</b> with your guests
        </div>
    )
}