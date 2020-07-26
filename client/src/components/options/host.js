import React, { useState, useEffect } from 'react';
import { getGameToken } from '../../services/rest';
import { createGame, getListOfAllPlayers } from '../../services/game-sockets'

export default function () {
    const [gameId, setGameId] = useState("");
    const [playersInLobby, setPlayersInLobby] = useState([]);

    useEffect(() => {
        if (!gameId) {
            getGameToken().then(data => {
                const gameId = data.data.gameId
                if (!gameId)
                    return;
               
                setGameId(gameId);
                createGame(gameId);
               
                // TODO list of players not being retrieved
                getListOfAllPlayers(gameId).then(listOfPlayers => {
                    setPlayersInLobby(listOfPlayers)
                    console.log(listOfPlayers)
                })
            })

        }

    })

    return (
        <div>Hey there Host, share the following gameid: <b>{gameId}</b> with your guests
        <div>
            Players in lobby:
            <ul>
                {
                    
                    playersInLobby? playersInLobby.forEach((player,index)=>{
                       return <li key={index}>{player}</li>
                    }): ""
                }
            </ul>
        </div>
        <button>Start Game</button>
        </div>
    )
}