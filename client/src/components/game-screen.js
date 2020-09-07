import React,{useState, useEffect} from 'react'
// import PropTypes from 'prop-types'
import DrawingBoard from './drawing-board.js'
import {withRouter} from 'react-router-dom'

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
        <div>
            <DrawingBoard gameId={gameId}></DrawingBoard>
        </div>
    )
}

// GameScreen.propTypes = {

// }

export default withRouter(GameScreen);

