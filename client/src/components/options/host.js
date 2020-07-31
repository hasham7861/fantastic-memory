import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { getGameToken } from '../../services/rest';
import { joinGame, closeGame, mySocket } from '../../services/game-sockets';
import { useCookies } from 'react-cookie';

import './host.css'

const Host = function (props) {

    // states
    const [gameId, setGameId] = useState("");
    const [playersInLobby, setPlayersInLobby] = useState([]);

    // config of react tools
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"])

    //============ Handlers ============
    // show all the players in lobby
    const setPlayersJSX = (playersList) => {
        setPlayersInLobby(Object.keys(playersList).map((p, i) => <li key={i}>{p}</li>))
    }

    // stop game and cleanup garbage
    const stopGame = () => {
        closeGame(gameId)
        removeCookie("gameId")
        removeCookie("hostId")
        props.history.push('/')
    }

    const startGame = () => {
        props.history.push({pathname:"/start-game",state:{gameId}})
    }
    //============ Hooks ============
    useEffect(() => {
        mySocket.on("players-list", function (listOfPlayers) {
            setPlayersJSX(listOfPlayers)
        })
        // Player has intiated one game
        if (!cookies.hasOwnProperty("gameId")) {
            // create the game
            getGameToken().then(resp => {
                setCookie("gameId", resp.data.gameId)
                mySocket.emit("get-id", {})
                joinGame(resp.data.gameId)
                mySocket.on("recieve-host-id", function (id) {
                    setCookie("hostId", id)
                    console.log("id" + id)
                    if (!gameId)
                        return;
                    setGameId(gameId);


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



    }, [gameId, cookies, setCookie])

    return (
        <div className="host-css">Hey there Host, share the following gameid: <span>{gameId}</span> with your guests
            <div>
                Players in lobby:
            <ul id="game-lobby-list">{playersInLobby}</ul>
            </div>
            <button onClick={startGame}>Start Game</button>
            <button onClick={stopGame} >Stop Game</button>
        </div>
    )
}

export default withRouter(Host);