import React,{useState, useEffect} from 'react'
// import PropTypes from 'prop-types'
import DrawingBoard from './GameSarted/DrawingBoard/DrawingBoard.js'
import {withRouter} from 'react-router-dom'
import { DrawingDashboard } from './GameSarted/DrawingDashboard/DrawingDashboard.js';

function GameScreen(props) {

    const [gameId, setGameId] = useState("");

    useEffect(()=>{
        if(!props.location.state){
            props.history.push("/")
        }else{
            
        }
        setGameId(props.history.location.state.gameId)
    },[props])
    
    return (
        // show different screen based on who is drawing currently
        <div className="GameScreen">
            <DrawingDashboard/>
            <DrawingBoard gameId={gameId}></DrawingBoard>
            
        </div>
    )
}

// GameScreen.propTypes = {

// }

export default withRouter(GameScreen);

