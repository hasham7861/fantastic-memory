import React, { useEffect } from 'react';
import io from 'socket.io-client';

import DrawingBoard from './components/drawing-board';

export default function () {

    useEffect(() => {
        const mySocket = io('http://localhost:5000')
        
        mySocket.on('connect', function () { });

        mySocket.on('event', function (data) { });
        mySocket.on('disconnect', function () { });
    })

    const style = {
        width: '100%',
        height: '600px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'Column',
        marginTop: '50px'
    }
    return (
        <div style={style}>
            <h1>Fantastic Memory</h1>
            <DrawingBoard />
        </div>
    )

}

