
import CanvasDraw from 'react-canvas-draw';
import { useRef, useState } from 'react';


const defaultProps = {
    onChange: null,
    loadTimeOffset: 5,
    lazyRadius: 30,
    brushRadius: 12,
    brushColor: "#444",
    catenaryColor: "#0a0302",
    gridColor: "rgba(150,150,150,0.17)",
    hideGrid: false,
    canvasWidth: 400,
    canvasHeight: 400,
    disabled: true,
    imgSrc: "",
    saveData: null,
    immediateLoading: false,
    hideInterface: false
};



export default function () {

    let drawingCanvas = useRef(null);

    const [canvasOptions, setCanvasOptions] = useState({
        brushRadius: "2px",
        brushColor: "orange",
        canvasWidth: "500px",
        canvasHeight: "500px",

    })

    return <div>

        <CanvasDraw
            ref={canvasDraw => (drawingCanvas = canvasDraw)}
            {...canvasOptions}
        />
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
}

