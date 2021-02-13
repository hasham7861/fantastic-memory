import React, { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import './GameScreen.css';
import DrawingBoard from './DrawingBoard/DrawingBoard';
import { withRouter, useHistory } from 'react-router-dom';
import { AppContext } from '../../App';

import { mySocket, checkIsMyTurn } from '../../services/game-sockets'

import { envUri } from '../../services/environment';

import { isNil } from 'ramda';
import { MainOption, Option } from '../../common/components/Button';

import {useCookies} from 'react-cookie'

GameScreen.propTypes = {
    location: {
        state: PropTypes.object
    }
}


function GameScreen(props) {

    const [removeCookie] = useCookies(["cookie-name"])
    const History = useHistory();

    const {location} = props
    const {state} = location


     // config of react tools
    const [cookies] = useCookies(["cookie-name"])

    // temporary solution for when user tries to reload screen, then it should end game
    window.onbeforeunload = function() {
        History.push("/")
        removeCookie("gameId")
        removeCookie("hostId")
    }.bind(this);

  
    mySocket.on("/navigate-to-gameover-screen", ()=>{
        History.push("/")
        removeCookie("gameId")
        removeCookie("hostId")
    })

    const [gameId, setGameId] = useState("");
    const dashboardRef = useRef();

    const { playerId } = useContext(AppContext)

    

    useEffect(() => {
        if (!state) {
            History.push("/")
        } else {
            setGameId(cookies.gameId)
        }
       
    }, [History, state, cookies.gameId])

    return ( <div className="GameScreen">
            <PaintMenuStyle dashboardRef={dashboardRef} />
            <div>
                <DrawingDashboard />
                <DrawingBoard gameId={gameId} ref={dashboardRef}></DrawingBoard>
                <GuessingInput gameId={gameId} playerId={playerId}></GuessingInput>
            </div>
            <PlayersInLobby />

        </div>
    )
}


PaintMenuStyle.propTypes = {
    dashboardRef : {
        current: {
            brushColorChange: Function,
            brushStrokeSizeChange: Function,
            clearCanvas: Function
        }
    }
}

function PaintMenuStyle(props) {

    const history = useHistory()

    const [,removeCookie] = useCookies(["cookie-name"])
    const { dashboardRef } = props;
    const brushColorChange = (event) => {
        dashboardRef.current.brushColorChange(event);
    }

    const brushStrokeSizeChange = (event) => {
        dashboardRef.current.brushStrokeSizeChange(event);
    }

    const clearCanvas = (e) => {
        e.preventDefault()
        dashboardRef.current.clearCanvas();
    }

    const stopGameHandler = (e) =>{
        e.preventDefault()
        removeCookie("gameId")
        removeCookie("hostId")
        history.push("/")
    }

    return <div id="PaintMenu">
        <b><p style={{ fontSize: "1.3rem" }}>Brush Setting</p></b>
        <label htmlFor="stroke">Select Size</label>
        <input name="stroke" type="range" id="stroke" min="4" max="10" step="2" defaultValue="4" onChange={brushStrokeSizeChange} />
        <br></br>
        <label>Select Color</label>
        <input style={{ marginLeft: "5px" }} type="color" name="brushStroke" defaultValue="black" onChange={brushColorChange} />
        <br></br>
        <br></br>
        <div className="paint-menu-style-container">
            <MainOption to="#" onClick={(e) => clearCanvas(e)}>Clear Canvas</MainOption>
            <Option  to="#" onClick={(e) => stopGameHandler(e)}>Stop Game</Option>
        </div>
    </div>
}


function DrawingDashboard() {

    const [isMyTurn, setIsMyTurn] = useState(false);
    const [drawingWord, setDrawingWord] = useState("");
    const [timeLeft, updateTimeLeft] = useState(0);

    mySocket.on("drawing-word", word => {
        if (word && word !== drawingWord) {
            setDrawingWord(word)
        }
    })

    mySocket.on("update-time-left", newTime => {
        updateTimeLeft(newTime)
    })

    checkIsMyTurn(setIsMyTurn);

    useEffect(() => {

    }, [])
    return (
        <div id="DrawingDashboard">
            <h3 style={{ "display": !isMyTurn ? "none" : "block" }}>Drawing word: <span style={{ color: "white" }}>{drawingWord}</span></h3>
            <h3 style={{ "display": timeLeft === 0 ? "none" : "block" }}>Time Left: <span style={{ color: "limegreen" }}>{timeLeft}</span></h3>
        </div>
    )
}

GuessingInput.propTypes = {
    gameId: String, 
    playerId: String
}
function GuessingInput(props) {

    const { gameId, playerId} = props

    const [isMyTurn, setIsMyTurn] = useState(false);
    const [inputGuess, setInputGuess] = useState("");
    const [guessedStatus, setGuessStatus] = useState(false);

    const verifyGuess = async (event) => {
        event.preventDefault()
        await fetch(envUri + "/game/guess_word", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId, guessedWord: inputGuess, playerId })
        }).then(async response => {
            const data = await response.json();
            const wordMatches = !!data.wordMatches;

            if (wordMatches)
                setGuessStatus(wordMatches);
        }).catch(()=> { return false })


    }

    checkIsMyTurn(setIsMyTurn);

    return (<div style={{ "display": isMyTurn ? "none" : "flex", justifyContent: "center" }}>
        <p style={{ display: guessedStatus ? "block" : "none", color: "green" }}>You have guessed the word correctly</p>
        <input type="text" name="guess-word-input" placeholder="guess word" disabled={guessedStatus}
            onChange={(e) => setInputGuess(e.currentTarget.value)}
            style={{ borderRadius: "5px" }}
        />
        {/* <input type="submit" value="guess word" disabled={guessedStatus} onClick={verifyGuess} /> */}
        <MainOption to="#" disabled={guessedStatus} onClick={(event)=>verifyGuess(event)} style={{ marginLeft: "10px" }} >Guess Word</MainOption>
    </div>)
}

function PlayersInLobby() {

      // config of react tools
    const [cookies] = useCookies(["cookie-name"])
    const history = useHistory()

    const [playerListJSX, updatePlayerListJSX] = useState("");

    mySocket.on("load-players-list", ({ players, currentPlayerId }) => {
        updatePlayerListJSX(formatPlayersToJSX(players, currentPlayerId))
    })

   

    const formatPlayersToJSX = (players, currentPlayerId) => {
        if (isNil(players))
            return

        const playersList = Object.keys(players).reduce((list, playerId) => {
            list.push(players[playerId])
            return list
        }, [])


        const playersListToJSX = playersList.map((player, index) => {
            if (player.id !== currentPlayerId) {
                return <li key={index}>
                    <p style={{ color: "#3D2175", fontSize: "1.2rem", wordBreak: "break-word", width: "200px" }}>${player.id}</p>
                    <p>Points {player.points}</p>
                </li>
            }
            return <li key={index} className="player-turn">
                <p style={{ color: "#3D2175", fontSize: "1.2rem", wordBreak: "break-word", width: "200px" }}>${player.id}</p>
                <p>Points {player.points}</p>
            </li>
        })

        return playersListToJSX


    }
    
    useEffect(() => {
        mySocket.emit("load-players", cookies.gameId, ()=>{
            //console.log("got here")
        });
 

        return function cleanup(){
            history.push("/")
        }
        

    },[cookies.gameId, history])

    return <div id="PlayersInLobby">
        <b><p style={{ fontSize: "1.3rem", display: "flex", justifyContent: "center" }}>Players</p></b>
        <ul style={{ overflowY: "auto" }}>
            {playerListJSX}
        </ul>
    </div>
}

export default withRouter(GameScreen);



