import './DrawingBoard.css'
import CanvasDraw from 'react-canvas-draw'
import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import React, { useContext } from 'react'
import { mySocket } from '../../../services/game-sockets'

import { GlobalContext } from '../../../AppContext'

const DrawingBoard = forwardRef((props, ref) => {
    // dom references
    let drawingCanvas = useRef(null)

    //// STATES
    const [canvasOptions, setCanvasOptions] = useState({
        onChange: null,
        loadTimeOffset: 5,
        lazyRadius: 1,
        brushRadius: 3,
        brushColor: "black",
        catenaryColor: "black",
        gridColor: "rgba(150,150,150,0.17)",
        hideGrid: true,
        canvasWidth: 500,
        canvasHeight: 420,
        disabled: false, // TODO by default it is disabled until the turn of player
        imgSrc: "",
        saveData: null,
        immediateLoading: false,
        hideInterface: false

    })

    const { playerId } = useContext(GlobalContext)
    /// END OF STATES

    // Handlers

    // These methods are to be called by reference from outside the component for example sibling or parent
    useImperativeHandle(ref, () => ({
        clearCanvas:()=>{
            drawingCanvas.clear()
        },
        brushColorChange: (event) => {
            setCanvasOptions({
                ...canvasOptions,
                brushColor: event.target.value,
                catenaryColor: event.target.value

            })
        },
        brushStrokeSizeChange: (event) => {
            setCanvasOptions({
                ...canvasOptions,
                brushRadius: parseInt(event.target.value)
            })
        }
    }))

    const newDrawnLineOnCanvasHandler = () => {
        // console.log(drawingCanvas.getSaveData())
        let canvasData = drawingCanvas.getSaveData() ? JSON.parse(drawingCanvas.getSaveData()) : null

        // console.log(canvasData)
        mySocket.emit("share-drawing-with-players",
            {
                gameId: props.gameId,
                playerId,
                canvasData
            })

    }
    // END OF Handlers

    // disable and enable drawing for the player
    mySocket.on("toggle-drawing-canvas", canvasDisabled => {
        // only toggle canvas when the state doesn't match
        if (canvasOptions.disabled !== canvasDisabled) {
            setCanvasOptions({ ...canvasOptions, disabled: canvasDisabled })
        }
    })

    useEffect(() => {

        if (props.gameId) {
            function loadDrawing(canvasData) {
                drawingCanvas.loadSaveData(JSON.stringify(canvasData), true)
            }

            // update the current canvas with other player drawing
            mySocket.on("draw-on-canvas", canvasData => {
                if (drawingCanvas && canvasData != null) {
                    loadDrawing(canvasData)// this loads the drawing
                }
            })

        }
    })

    return (
        <div id="drawing-container">
            <div
                // share drawing once user clicks off drawn line
                onClick={() => newDrawnLineOnCanvasHandler()}>
                <CanvasDraw
                    ref={canvasDraw => (drawingCanvas = canvasDraw)}
                    {...canvasOptions}
                    style={{ border: '1px solid #ccc', margin: '10px', borderRadius:'7px' }}
                    // update the drawing locally
                    onChange={
                        () => {
                            localStorage.setItem("savedDrawing", drawingCanvas.getSaveData())
                        }
                    }
                />
            </div>
        </div>
    )
})
export default DrawingBoard