
import CanvasDraw from 'react-canvas-draw';
import { useRef, useState } from 'react';

export default function () {

    let drawingCanvas = useRef(null);

    const [canvasOptions, setCanvasOptions] = useState({
        onChange: null,
        loadTimeOffset: 5,
        lazyRadius: 1,
        brushRadius: 5,
        brushColor: "#444",
        catenaryColor: "#0a0302",
        gridColor: "rgba(150,150,150,0.17)",
        hideGrid: false,
        canvasWidth: 400,
        canvasHeight: 400,
        disabled: false,
        imgSrc: "",
        saveData: null,
        immediateLoading: false,
        hideInterface: false

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

