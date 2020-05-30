import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { isServerUp, envUri } from '../util/server';

import DrawingBoard from './drawing-board';


const getGameToken = async () => {
    return axios.get(envUri + "/game/generate_game_id").then(data => data).catch(err => {
        return null
    });
};

const initiateGameSockets = () => {
    const mySocket = io(envUri)
    mySocket.on('connect', function () { });
    mySocket.on('event', function (data) { });
    mySocket.on('disconnect', function () { });
    return "intiated all socket"
}
export default function () {
    const [gameId, setGameId] = useState("");
    useEffect(() => {
        isServerUp(initiateGameSockets)
        if (!gameId) {
            isServerUp(getGameToken).then(data => {
                console.log(data.data.gameId);
                setGameId(data.data.gameId)
            })
        }
    })

    const style = {
        width: '100%',
        height: '300px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'Column',
        color: "blue"
    }
    const optionsContainer = {
        display: "flex",
        flexDirection: "Row"
    }
    const btnStyle = {
        border: '1px solid blue',
        padding: '10px',
        margin: '5px',
        borderRadius: "20px",
        textDecoration: "none",
        color: "blue"

    }
    return (
        <div style={style}>
            <h1>Fantastic Memory</h1>
            <div style={optionsContainer}>
                <Link style={btnStyle} to="/host-game">Host Game</Link>
                <Link style={btnStyle} to="/join-game">Join Game</Link>
            </div>
        </div>
    )
}