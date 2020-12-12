import React, { useState, useEffect, useContext, useRef } from 'react';
import './GameScreen.css';
import DrawingBoard from './DrawingBoard/DrawingBoard';
import { withRouter } from 'react-router-dom';

import { AppContext } from '../../App';

import { mySocket, checkIsMyTurn } from '../../services/game-sockets'

import { envUri } from '../../services/environment';




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
            <PlayersInLobby />

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

    const clearCanvas = () => {
        dashboardRef.current.clearCanvas();
    }

    return <div id="PaintMenu">
        <b><p>Brush Options</p></b>
        <label htmlFor="stroke">Stroke</label>
        <input name="stroke" type="range" id="stroke" min="4" max="10" step="2" defaultValue="4" onChange={brushStrokeSizeChange} />
        <br></br>
        <label>Color </label>
        <input type="color" name="brushStroke" defaultValue="black" onChange={brushColorChange} />
        <br></br>
        <br></br>
        <button onClick={clearCanvas}>Clear Canvas</button>
        <button id="leave-game">Leave Game</button>
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
            <h4 style={{ "display": !isMyTurn ? "none" : "block" }}>Drawing word: <span style={{ color: "blue" }}>{drawingWord}</span></h4>
            <h4 style={{ "display": timeLeft === 0 ? "none" : "block" }}>Time Left: <span style={{ color: "red" }}>{timeLeft}</span></h4>
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
    return <div id="PlayersInLobby">
        <b><p>Players</p></b>
        <ul>
            <li>
                <p>/game-nsp#iltrQRgZ9Jzkn1cRAACA</p>
                <p>Points 0 </p>
            </li>
            <li className="player-turn">
                <p>/game-nsp#iltrQRgZ9Jzkn1cRAACB</p>
                <p>Points 3 </p>
            </li>
            <li>
                <p>/game-nsp#iltrQRgZ9Jzkn1cRAACC</p>
                <p>Points 2 </p>
            </li>
        </ul>
    </div>
}


// GameScreen.propTypes = {

// }

export default withRouter(GameScreen);

