import React, { useState, useEffect, useContext} from 'react';
import { withRouter } from 'react-router-dom';
import { getGameToken } from '../../services/rest';
import { joinGame, closeGame, mySocket } from '../../services/game-sockets';
import { useCookies } from 'react-cookie';

import './host.css'
import { AppContext } from '../../App'

const Host = function (props) {

    // states
    const [gameId, setGameId] = useState("");
    const [playersInLobby, setPlayersInLobby] = useState([]);
    const {playerId,setPlayerId} = useContext(AppContext)

    // config of react tools
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"])

    //============ Handlers ============
    // show all the players in lobby
    const setPlayersJSX = (playersList) => {
        setPlayersInLobby(
            Object.keys(playersList).map(
                (p, i) => {
                    return <li key={i}>{p}</li>
                }
            )
        )
    }

    // stop game and cleanup garbage
    const stopGame = () => {
        closeGame(gameId)
        removeCookie("gameId")
        removeCookie("hostId")
        props.history.push('/')
    }

    const startGame = () => {
        // move to start game push
        props.history.push({ pathname: "/start-game", state: { gameId } })

        // signal to all the other clients in the same socket that game has started
        mySocket.emit("game-started", gameId)
    }
    //============ Hooks ============
    useEffect(() => {
      
        mySocket.on("player-id", function (id) {  
            setCookie("hostId", id)
              // save playerId into context
            setPlayerId(id)
        })

        // Player has not hosted any game at the moment
        if (!cookies.hasOwnProperty("gameId") && !cookies.hasOwnProperty("hostId")) {
            // create the game
            getGameToken().then(resp => {
                setCookie("gameId", resp.data.gameId)
                joinGame(resp.data.gameId, 0)
                // make sure to set local host-id
                mySocket.emit("get-id", {})
                // refresh the component to refresh the playerlist
                props.history.go('0')

            })
            // When player is not in any game

           
        }
        else if (cookies.hasOwnProperty("hostId")) {
            setGameId(cookies.gameId)
            mySocket.emit("update-host-id", cookies.gameId)
            joinGame(cookies.gameId);

            // listen to player-list event
            mySocket.on("players-list", function (listOfPlayers) {
                // only update players if there is new players being added
                setPlayersJSX(listOfPlayers)
            })

            mySocket.emit("find-players-list", gameId);

            // mySocket.emit("enable-drawing-canvas", ({ gameId: cookies.gameId }))


        }

       

        // // TODO: disable and enable drawing for the player
        // mySocket.on("toggle-drawing-canvas", canvasDisabled => {
        //     // toggle canvas options, enable drawing canvas for only some players

        //     // update the state once
        //     console.log(canvasDisabled)
        //         // setCanvasOptions({...canvasOptions, disabled: canvasDisabled})
           
        // })






        //cleanup
        return (() => {
        })


    }, [gameId, cookies, setCookie, removeCookie, props, setPlayerId])




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