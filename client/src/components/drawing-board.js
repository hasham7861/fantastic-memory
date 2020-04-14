import CanvasDraw from 'react-canvas-draw';
import { useRef, useState } from 'react';
import React from 'react';


export default function DrawingBoard() {

    // dom references
    let drawingCanvas = useRef(null);

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
        disabled: false,
        imgSrc: "",
        saveData: null,
        immediateLoading: false,
        hideInterface: false

    })
    /// END OF STATES

    ////// CSS
    const containerStyle = {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'Row'
    }

    const ioMenuStyle = {
        display: "flex",
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'row'
    }

    const paintMenuStyle = {
        display:"flex",
        flexDirection:"Column",
        justifyContent:'center',
        alignItems:'center'

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

    const brushStrokeSizeChange = (event) =>{

        setCanvasOptions({
            ...canvasOptions,
            brushRadius: parseInt(event.target.value)
        })
    }
    // END OF Handlers
    return (
        <div style={containerStyle}>
            <div style={ioMenuStyle}>
                <button onClick={()=>drawingCanvas.undo()}>Undo</button>
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


            <CanvasDraw
                ref={canvasDraw => (drawingCanvas = canvasDraw)}
                {...canvasOptions}
                style={{border:'1px solid #ccc', margin:'10px'}}
            />

            <div style={paintMenuStyle}>
                <label htmlFor="stroke">Brush Stroke</label>
                <input name="stroke" type="range" id="stroke" min="4" max="10"step="2" defaultValue="4" onChange={brushStrokeSizeChange} />
                <label>Brush Color</label>
                <input type="color" name="brushStroke" defaultValue="black" onChange={brushColorChange} />
            </div>

        </div>
    )
}