import React, { useEffect } from 'react';
import { Link } from 'react-router-dom'
import { initiateGameSockets } from '../services/game-sockets';


initiateGameSockets.then(data=>data);

export default function () {
    useEffect(()=>{
        
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