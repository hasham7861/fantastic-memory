import React from 'react'
// import PropTypes from 'prop-types'
import DrawingBoard from './drawing-board.js'
import {withRouter} from 'react-router-dom'

function GameScreen(props) {
    if(!props.location.state){
        props.history.push("/")
    }
    
    return (
        <div>
            <DrawingBoard></DrawingBoard>
        </div>
    )
}

// GameScreen.propTypes = {

// }

export default withRouter(GameScreen);

