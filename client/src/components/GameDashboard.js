import React, { useState, useEffect } from 'react'
import { mySocket } from '../services/game-sockets'
import { useCookies } from 'react-cookie'

export const GameDashboard = () => {

    const [drawingWord, setDrawingWord] = useState("")
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"])

    useEffect(() => {

        mySocket.emit("do-i-get-a-word", cookies["gameId"])
        mySocket.on("get-drawing-word", word => {
            if (word && word != drawingWord){
                setDrawingWord(word)
                console.log(word)
            }
        })
    }, [])
    return (
        <div style={{
            border: "1px solid #ccc",
            width: "100px",
            "height": "100px",
            "display": drawingWord == "" ? "none" : "block",
        }}>
            <h4>Drawing word: <span style={{ color: "blue" }}>{drawingWord}</span></h4>
        </div>
    )
}
