import React from 'react';
import {withRouter} from 'react-router-dom'

const GameOver = (props) =>{
    return <div>
        {/* TODO: Make the game over screen a bit more dynamic */}
        <h1>GameOver</h1>
        <ul>
            <li>
                <p>/game-nsp#iltrQRgZ9Jzkn1cRAACA</p>
                <p>Points 0 </p>
            </li>
            <li>
                <p>/game-nsp#iltrQRgZ9Jzkn1cRAACB</p>
                <p>Points 3 </p>
            </li>
            <li>
                <p>/game-nsp#iltrQRgZ9Jzkn1cRAACC</p>
                <p>Points 2 </p>
                </li>
        </ul>
        <button onClick={()=>props.history.push("/")}>Return to Menu</button>
    </div>
}

export default withRouter(GameOver);