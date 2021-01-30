import React, { useState, useEffect, useContext, useRef } from 'react';
import './GameScreen.css';
import DrawingBoard from './DrawingBoard/DrawingBoard';
import { withRouter } from 'react-router-dom';

import { AppContext } from '../../App';

import { mySocket, checkIsMyTurn } from '../../services/game-sockets'

import { envUri } from '../../services/environment';

import {isNil} from 'ramda';
import { MainOption, Option } from '../../common/components/Button';

function GameScreen(props) {

    const [gameId, setGameId] = useState("");
    const dashboardRef = useRef();

    const { playerId } = useContext(AppContext)

    useEffect(() => {
        if (!props.location.state) {
            props.history.push("/")
        } else {

        }
        setGameId(props.history.location.state.gameId)
    }, [props])

    return (
        // show different screen based on who is drawing currently
        <div className="GameScreen">

            <PaintMenuStyle dashboardRef={dashboardRef} />
            <div>
                <DrawingDashboard />
                <DrawingBoard gameId={gameId} ref={dashboardRef}></DrawingBoard>
                <GuessingInput gameId={gameId} playerId={playerId}></GuessingInput>
            </div>
            <PlayersInLobby gameId={gameId}/>

        </div>
    )
}



function PaintMenuStyle(props) {

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

    return <div id="PaintMenu">
        <b><p style={{fontSize:"1.3rem"}}>Brush Setting</p></b>
        <label htmlFor="stroke">Select Size</label>
        <input name="stroke" type="range" id="stroke" min="4" max="10" step="2" defaultValue="4" onChange={brushStrokeSizeChange} />
        <br></br>
        <label>Select Color</label>
        <input style={{marginLeft:"5px"}}type="color" name="brushStroke" defaultValue="black" onChange={brushColorChange} />
        <br></br>
        <br></br>
        <div className="paint-menu-style-container">
            <MainOption onClick={(e)=>clearCanvas(e)}>Clear Canvas</MainOption>
            <Option>Stop Game</Option>
        </div>
    </div>
}





function DrawingDashboard() {

    const [isMyTurn, setIsMyTurn] = useState(false);
    const [drawingWord, setDrawingWord] = useState("");
    const [timeLeft, updateTimeLeft] = useState(0);

    mySocket.on("drawing-word", word => {
        if (word && word !== drawingWord) {
            console.log(word)
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

function GuessingInput({ gameId, playerId }) {


    const [isMyTurn, setIsMyTurn] = useState(false);
    const [inputGuess, setInputGuess] = useState("");
    const [guessedStatus, setGuessStatus] = useState(false);

    const verifyGuess = async () => {

        let guessVerified = await fetch(envUri + "/game/guess_word", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gameId, guessedWord: inputGuess, playerId })
        }).then(async response => {
            const data = await response.json();
            const wordMatches = !!data.wordMatches;

            if (wordMatches)
                setGuessStatus(wordMatches);
        }).catch(err => { console.log(err); return false })


    }

    checkIsMyTurn(setIsMyTurn);

    return (<div style={{ "display": isMyTurn ? "none" : "block" }}>
        <p style={{ display: guessedStatus ? "block" : "none", color: "green" }}>You have guessed the word correctly</p>
        <input type="text" name="guess-word-input" placeholder="guess word" disabled={guessedStatus} onChange={(e) => setInputGuess(e.currentTarget.value)} />
        <input type="submit" value="guess word" disabled={guessedStatus} onClick={verifyGuess} />
    </div>)
}



function PlayersInLobby() {
  
    const [playerListJSX, updatePlayerListJSX ] = useState("");
    mySocket.on("load-players-list", ({players, currentPlayerId}) => {
     
        updatePlayerListJSX(formatPlayersToJSX(players,currentPlayerId))
    })

    const formatPlayersToJSX = (players, currentPlayerId) =>{
    
        if (isNil(players))
            return
       
        const playersList = Object.keys(players).reduce((list, playerId) =>{
            list.push(players[playerId])
            return list
        },[])

        
        const playersListToJSX = playersList.map((player, index)=>{
            if(player.id != currentPlayerId){
                return <li key={index}>
                        <p>${player.id}</p>
                        <p>Points {player.points}</p>
                    </li>
            }
            return <li key={index} className="player-turn">
                        <p style={{color:"#3D2175", fontSize:"1.2rem", wordBreak:"break-word", width:"200px"}}>${player.id}</p>
                        <p>Points {player.points}</p>
                    </li>
        })

        return playersListToJSX

        
        
        
    }
    useEffect(()=>{

    })
    return <div id="PlayersInLobby">
        <b><p style={{fontSize:"1.3rem", display:"flex",justifyContent:"center"}}>Players</p></b>
        <ul style={{overflowY:"auto"}}>
            {playerListJSX}
        </ul>
    </div>
}

export default withRouter(GameScreen);

