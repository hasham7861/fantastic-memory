import React from 'react';

import DrawingBoard from './components/drawing-board';

export default function () {

    const style = {
        width:'100%',
        height:'600px',
        display:'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection:'Column',
        marginTop:'50px'
    }
    return (
        <div style={style}>
            <h1>Fantastic Memory</h1>
            <DrawingBoard/>
        </div>
    )
   
}

