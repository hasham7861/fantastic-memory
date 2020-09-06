import CanvasDraw from 'react-canvas-draw';
import { useRef, useState, useEffect } from 'react';
import React, { useContext } from 'react';
import { mySocket } from '../services/game-sockets'
import { useCookies } from 'react-cookie';

import { AppContext } from '../App'

export default function DrawingBoard(props) {

    // dom references
    let drawingCanvas = useRef(null);

    // config of react tools
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"])

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
        canvasWidth: 600,
        canvasHeight: 400,
        disabled: false, // TODO: connect this with switch user event
        imgSrc: "",
        saveData: null,
        immediateLoading: false,
        hideInterface: false

    })

    const { playerId } = useContext(AppContext)
    /// END OF STATES

    ////// CSS
    const containerStyle = {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'Row'
    }

    const ioMenuStyle = {
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    }

    const paintMenuStyle = {
        display: "flex",
        flexDirection: "Column",
        justifyContent: 'center',
        alignItems: 'center'

    }
    /////// END OF CSS

    // Handlers
    const brushColorChange = (event) => {

        setCanvasOptions({
            ...canvasOptions,
            brushColor: event.target.value,
            catenaryColor: event.target.value

        })
    }

    const brushStrokeSizeChange = (event) => {

        setCanvasOptions({
            ...canvasOptions,
            brushRadius: parseInt(event.target.value)
        })
    }

    const newDrawnLineOnCanvasHandler = _ => {
        // console.log(drawingCanvas.getSaveData())
        let canvasData = drawingCanvas.getSaveData() ? JSON.parse(drawingCanvas.getSaveData()) : null;

        mySocket.emit("share-drawing-with-players",
            {
                gameId: props.gameId,
                playerId,
                canvasData
            });



    }
    // END OF Handlers


    useEffect(() => {

        function loadDrawing(canvasData) {
            drawingCanvas.loadSaveData(JSON.stringify(canvasData), true)
        }
     
        // update the current canvas with other player drawing
        mySocket.on("draw-on-canvas", canvasData => {
            if (drawingCanvas && canvasData != null) {             
                loadDrawing(canvasData)// this loads the drawing
            }
        })
        
        // TODO: disable and enable drawing for the player
        mySocket.on("toggle-drawing", _ => {
            // toggle canvas options, enable drawing canvas for only some players
            // let updateCanvasOptionsState = Object.assign(
        })
    })



    return (
        <div style={containerStyle}>
            <div style={ioMenuStyle}>
                <button onClick={() => drawingCanvas.undo()}>Undo</button>
                <button onClick={() => drawingCanvas.clear()}> Clear </button>
                <button onClick={() => localStorage.setItem("savedDrawing", drawingCanvas.getSaveData())}> Save</button>
                <button onClick={() => {
                    setCanvasOptions(
                        {
                            ...canvasOptions,
                            saveData: localStorage.getItem('savedDrawing')
                        }
                    )
                }}
                > Load</button>
            </div>


            <div
             // share drawing once user clicks off drawn line
             onClick={()=>newDrawnLineOnCanvasHandler()}>
                <CanvasDraw
                    ref={canvasDraw => (drawingCanvas = canvasDraw)}
                    {...canvasOptions}
                    style={{ border: '1px solid #ccc', margin: '10px' }}
                    // update the drawing locally
                    onChange={
                        () => {
                            localStorage.setItem("savedDrawing", drawingCanvas.getSaveData())
                        }
                    }
                />
            </div>

            <div style={paintMenuStyle}>
                <label htmlFor="stroke">Brush Stroke</label>
                <input name="stroke" type="range" id="stroke" min="4" max="10" step="2" defaultValue="4" onChange={brushStrokeSizeChange} />
                <label>Brush Color</label>
                <input type="color" name="brushStroke" defaultValue="black" onChange={brushColorChange} />
            </div>

        </div>
    )
}