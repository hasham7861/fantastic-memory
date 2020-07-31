import React from 'react'
import PropTypes from 'prop-types'
import DrawingBoard from './drawing-board.js'

function GameScreen(props) {
    return (
        <div>
            <DrawingBoard></DrawingBoard>
        </div>
    )
}

GameScreen.propTypes = {

}

export default GameScreen;

