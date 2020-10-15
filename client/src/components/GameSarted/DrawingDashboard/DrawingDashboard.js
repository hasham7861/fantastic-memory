import React, { useState, useEffect } from 'react'
import { mySocket } from '../../../services/game-sockets'
import { useCookies } from 'react-cookie'
import './DrawingDashboard.css';

export const DrawingDashboard = () => {

    const [drawingWord, setDrawingWord] = useState("");
    const [timeLeft, updateTimeLeft] = useState(0);
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"]);
    const [isMyTurn, setIsMyTurn] = useState(false);


    useEffect(() => {

        mySocket.on("drawing-word", word => {
            if (word && word != drawingWord) {
                setDrawingWord(word)
                console.log(word)
            }
        })

        mySocket.on("update-time-left", newTime => {
            updateTimeLeft(newTime)
        })

        mySocket.on("is-my-turn", isMyTurn => {
            setIsMyTurn(isMyTurn);
        })

    }, [])
    return (
        <div id="DrawingDashboard">
            <h4 style={{ "display": drawingWord == "" ? "none" : "block" }}>Drawing word: <span style={{ color: "blue" }}>{drawingWord}</span></h4>
            <h4 style={{ "display": timeLeft == 0 ? "none" : "block" }}>Time Left: <span style={{ color: "red" }}>{timeLeft}</span></h4>
            <div style={{ "display": isMyTurn ? "none" : "block" }}>
                <input type="text" name="guess-word-input" placeholder="guess word" />
                <input type="submit" value="guess word" />
            </div>
        </div>
    )
}
