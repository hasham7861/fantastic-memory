import React, { useState, useEffect } from 'react';
import { getGameToken } from '../../services/rest';
import { joinGame, mySocket } from '../../services/game-sockets';
import { useCookies } from 'react-cookie';

export default function () {
    const [gameId, setGameId] = useState("");
    const [playersInLobby, setPlayersInLobby] = useState([]);

    const [cookies, setCookie] = useCookies(["cookie-name"])


    const setPlayersJSX = (playersList) => {
        setPlayersInLobby(playersList.map((p, i) => <li key={i}>{p}</li>))
    }



    useEffect(() => {
        mySocket.on("players-list", function (listOfPlayers) {
            setPlayersJSX(listOfPlayers)
        })
        // Player has intiated one game
        if (!cookies.hasOwnProperty("gameId")) {
            console.log("got here")
            getGameToken().then(resp => {
                setCookie("gameId", resp.data.gameId)
                mySocket.emit("get-id", {})
                mySocket.on("recieve-host-id", function (id) {
                   
                    setCookie("hostId", id)
                    if (!gameId)
                        return;
                    setGameId(gameId);
                    joinGame(gameId);

                    // retrieve players list
                    mySocket.emit("find-players-list", gameId);
                })
            })
        // When player is not in any game
        } else {
            setGameId(cookies.gameId)
            if (!cookies.hasOwnProperty("hostId")) {
                joinGame(cookies.gameId);
            }
            // 
            // console.log("loading gameId from cookie")
            // retrieve players list
            mySocket.emit("find-players-list", cookies.gameId);

        }

       

    }, [])

    return (
        <div>Hey there Host, share the following gameid: <b>{gameId}</b> with your guests
            <div>
                Players in lobby:
            <ul>{playersInLobby}</ul>
            </div>
            <button>Start Game</button>
            <button >Leave Game</button>
        </div>
    )
}