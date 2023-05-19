/* eslint-disable react/no-unescaped-entities */
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useRef, useContext } from 'react';
import { joinGame, mySocket } from '../../../services/game-sockets';
import { withRouter, Link } from 'react-router-dom'
import { isValidGameId } from '../../../services/rest'
import styled from 'styled-components'

import { AppContext } from '../../../App'

function Guest(props) {

    const { gameId, setGameId } = useContext(AppContext)
    const [inputGameId, setInputGameId] = useState("");
    const joinGameDiv = useRef(null)
    const waitingDiv = useRef(null)
    const invalidGameIdDiv = useRef(null)
    const [errorMessage, setErrorMessage] = useState("")

    const { setPlayerId } = useContext(AppContext)

    const joinLobby = () => {
        // join game if use enters a valid id
        if (inputGameId.length > 1) {
            isValidGameId(inputGameId).then(resp => {
                const {game_id_valid, error_message} = resp.data
                let isGameIdValid = game_id_valid
                if (isGameIdValid === true) {
                    joinGameDiv.current.style.display = "none"
                    waitingDiv.current.style.display = "block"
                    invalidGameIdDiv.current.style.display = "none"
                    joinGame(inputGameId)
                } else if (isGameIdValid === false) {
                    invalidGameIdDiv.current.style.display = "block"
                    setErrorMessage(error_message)

                }
            })
        }

    }

    useEffect(() => {
        mySocket.emit("get-id")
        mySocket.on("player-id", function (id) {
            setPlayerId(id)
        })

        mySocket.on("start-game", (data) => {
            //change the page to start-game with your socid to refer back to and gameId
            props.history.push({ pathname: "/start-game", state: data })
        })

    }, [props.history, setPlayerId])

    const onInputGameIdHandler = (e) => {
        setInputGameId(e.target.value)
        setGameId(e.target.value)
    }

    return (
        <GuestContainer id="guest">
            <Heading>Join Game</Heading>
            <SubHeading>join your friend's game lobby</SubHeading>
            <div ref={joinGameDiv}>
                <GameInputWrapper>
                    <h3>GameId</h3>
                    <GameInputText type="text" name="gameId" id="gameId" placeholder="gameid..." value={inputGameId} onChange={onInputGameIdHandler} />
                </GameInputWrapper>
                <OptionsContainer>
                    <MainOption to="#" onClick={joinLobby}>Join Lobby</MainOption>
                    <Option to="/">Return Home</Option>
                </OptionsContainer>
            </div>
            <div ref={invalidGameIdDiv} style={{ display: "none", color: "red" }}>
                <p>{errorMessage}</p>
            </div>
            <div ref={waitingDiv} style={{ display: "none" }}>
                <p >Waiting on host to start the game</p>
            </div>
        </GuestContainer>
    )
}

const GuestContainer = styled.div`
    margin: 2rem;
    button {
        margin-left: 1rem;
   }
   p{
       color:#3D2175;
   }
   display:flex;
    width: 100%;
    height: 700px;
    justify-content: center;
    align-items: center;
    flex-direction: Column;
` 

const Heading = styled.h1`
    color:#3D2175;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 4rem;
    line-height:0;
`

const SubHeading = styled.h2`
    color: #9E83D4;
    font-family: Helvetica, Arial, sans-serif;
    font-weight:lighter;
    line-height:0;
    margin-bottom:40px;
`

const GameInputWrapper = styled.div`
    display:flex;
    justify-content:center;
`
const GameInputText = styled.input.attrs({type:"text"})`
   color:#3D2175;
   height:20px;
   margin-left:10px;
   margin-top:15px;
`

const OptionsContainer = styled.div`
    display: flex;
    flex-direction: Row;
`

const Option = styled(Link)`
    border: 1px solid #3D2175;
    padding: 10px 30px;
    margin: 5px;
    border-radius: 20px;
    text-decoration: none;
    color: #3D2175;
`

const MainOption = styled(Option)`
    background-color:#3D2175;
    color:white;
`

export default withRouter(Guest)
