/* eslint-disable react/prop-types */
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { withRouter } from 'react-router-dom';
import { getGameToken } from '../../../services/rest';
import { joinGame, closeGame, mySocket } from '../../../services/game-sockets';
import styled from "styled-components"
import { Link } from 'react-router-dom'
import { Smile as IconSmile, Key as IconKey, Clipboard as IconClipBoard} from 'react-feather';

import { AppContext } from '../../../App'
import { envUri } from '../../../services/environment';

import {isNil, equals}  from 'ramda'

const Host = function (props) {

    console.log("Host component is rendering")
    // states
    const [playersInLobby, setPlayersInLobby] = useState([])
    const { playerId, setPlayerId, gameId, setGameId } = useContext(AppContext)
    const [errAlertElement, setErrAlertElement] = useState(null)
    

    //============ Handlers ============
    // show all the players in lobby
    const setPlayersJSX = (players) => {
        if(players.length == 0){
            return null
        }
        return (
            players.map(
                (p, i) => {
                    return (
                        <PlayerRow key={i}>
                            <span>
                                <IconSmile color="black" width="40px" height="30px"/>
                            </span>
                            <span>
                                {p}
                            </span>
                        </PlayerRow>
                        )
                }
            )
        )
        
    }

    // stop game and cleanup garbage
    const stopGame = () => {
        closeGame(gameId)
        setPlayerId("")
        setGameId("")
        props.history.push('/')
    }

    const startGame = async (event) => {
        // move to start game push
        // props.history.push({ pathname: "/start-game", state: { gameId } })
        event.preventDefault()
        await fetch(envUri + "/game/start_game",
            {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ gameId })
            })
           
        // if(!isNil(data.error_message)){
        //     console.log(data.error_message)
        //     setErrAlertElement(data.error_message)
        // }
            
        
        // signal to all the other clients in the same socket that game has started
        // mySocket.emit("game-started", gameId)
    }

    const onStartGameSocketEvent = useCallback((data) => {
         //change the page to start-game with your socid to refer back to and gameId
        props.history.push({ pathname: "/start-game", state: data })
    },[props.history])

    const onPlayerListSocketEvent = useCallback((players) => {
        console.log('inside the core function loading players.....')
        const listOfPlayerIds = Object.keys(players)
        // TODO if listOfPlayers is null, then don't set jsx, and remove all hostRelated cookies
        // only update players if there is new players being added
        console.log('comparing players state', listOfPlayerIds, playersInLobby)
        if(equals(listOfPlayerIds, playersInLobby) === false)
            setPlayersInLobby(listOfPlayerIds)
    },[setPlayersInLobby, playersInLobby])

    const onPlayerIdSocketEvent = useCallback((id) => {
        // setCookie("hostId", id, { expires: new Date(new Date().getTime() + 60000) })
        // save playerId into context
        setPlayerId(id)
        // if(playerId)
        console.log('should try to load players..')
        mySocket.emit("find-players-list", gameId);
    },[gameId, setPlayerId, playerId])

    //============ Hooks ============
    useEffect(() => {
        mySocket.on("start-game", onStartGameSocketEvent)
        return (() => {
            mySocket.off("start-game", onStartGameSocketEvent)
        })
    },[onStartGameSocketEvent])
    
    useEffect(() => {
        mySocket.on("player-id", onPlayerIdSocketEvent)
        
        return (() => {
            mySocket.off("player-id", onPlayerIdSocketEvent)
        })
    }, [onPlayerIdSocketEvent])

    useEffect(() => {

        // listen to player-list event
        mySocket.on("players-list", onPlayerListSocketEvent)
        return (() => {
            mySocket.off("players-list", onPlayerListSocketEvent)
        })
    }, [onPlayerListSocketEvent])
   
    // FIXME: why is this component re-rendering 4 to 5 times on first try clicking of host game button
    useEffect( () => {

        async function firstTimeSetupHost() {
            
            console.log("intial state: ", gameId)
            if(!gameId){
                const resp = await getGameToken()

                setGameId(resp.data.gameId)
                joinGame(resp.data.gameId, 0)
            }
            mySocket.emit("get-id", {})
            // console.log('should rerender players, ', gameId, playersInLobby) 
        }

        firstTimeSetupHost()
       
        // //cleanup
        return (() => {

        })

    }, [gameId, setGameId, playerId, playersInLobby])


    // useEffect(() => {   
    // },[gameId, playerId, playersInLobby])


    const copyToClipboard = () => { 
        navigator.clipboard.writeText(gameId)
    };

    return (
        
        <HostContainer>
            <Heading>Host Game</Heading>
            <SubHeading>host game for your friends to join game</SubHeading>
            <GameId><IconKey/><span>GameId: </span> <span style={{color:"black"}}>{gameId}</span><IconClipBoard style={{cursor:"pointer"}}onClick={copyToClipboard}/></GameId>
            <ErrorAlert style={{display:errAlertElement ? "block" :"none"}}>{errAlertElement}</ErrorAlert>
            <PLayersListWrapper>{setPlayersJSX(playersInLobby)}</PLayersListWrapper>
            <OptionsContainer>
                <MainOption to="#" onClick={(event)=>startGame(event)}>Start Game</MainOption>
                <Option to="#" onClick={stopGame}>Stop Game</Option>
            </OptionsContainer>
        </HostContainer>
    )
}

const HostContainer = styled.div`
    display:flex;
    width: 100%;
    height: 700px;
    justify-content: center;
    align-items: center;
    flex-direction: Column;
    margin: 2rem;
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
const ErrorAlert = styled.p`
    font-family: Helvetica, Arial, sans-serif;
    font-weight:lighter;
    color:red;
    font-size:1rem;
    display:block;
    margin-top:10px;
`
const GameId = styled.h3`
     color:#3D2175;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 1.5rem;
    display:flex;
    svg{
        margin:0 5px;
    }
    span{
        margin: 0 5px;
    }

`
const PLayersListWrapper = styled.ul`
    width:500px;
    height:200px;
    background-color: #f1def1;
    font-family: Helvetica, Arial, sans-serif;
    color:#3D2175;
    font-size:1.5rem;
    border-radius:20px;
    padding:50px;
    margin-bottom:30px;
    list-style: none;
    overflow-y: auto;
    display:flex;
    align-items:center;
    flex-direction:column;
`

const PlayerRow = styled.li`
    padding-bottom:5px;
    display: flex;
    span{
        margin:0 5px;
    }
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

export default withRouter(Host);