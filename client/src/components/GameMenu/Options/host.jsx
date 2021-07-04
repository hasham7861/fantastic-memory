import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import GameApiClient from '../../../services/GameApiClient';
import { closeGame, mySocket } from '../../../services/GameWebSocketClient';
import { useCookies } from 'react-cookie';
import styled from "styled-components"
import { Link } from 'react-router-dom'
import { Smile as IconSmile, Key as IconKey, Clipboard as IconClipBoard } from 'react-feather';

import { GlobalContext } from '../../../AppContext'

import { isNil } from 'ramda'


const getGameIdOtherwiseCreateAndGet = async () => {

    const getCurrentGameId = async () => {
        const resp = await GameApiClient.request("/game/get_current_game_id")
        const data = await resp.json()
        const { gameId } = data

        return gameId
    }

    let gameId = await getCurrentGameId()
    if (isNil(gameId)) {
        await GameApiClient.request("/game/generate_game_id")
        gameId = await getCurrentGameId()
    }
    return gameId
}

const getPlayerUsername = async () => {
    const resp = await GameApiClient.request("/player/get_current_username")
    const data = await resp.json()
    const { username } = data
    return username
}

const Host = function (props) {

    // states
    const [playersInLobby, setPlayersInLobby] = useState([]);
    const { playerId, setPlayerId, gameId, setGameId } = useContext(GlobalContext)
    const [errAlertElement, setErrAlertElement] = useState(null)

    // config of react tools
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"])



    //============ Handlers ============
    // show all the players in lobby
    const setPlayersJSX = (playersList) => {
        setPlayersInLobby(
            Object.keys(playersList).map(
                (p, i) => {
                    return (<PlayerRow key={i}><span><IconSmile color="black" width="40px" height="30px" /></span><span>{playersList[p].id}</span></PlayerRow>)
                }
            )
        )
    }

    // stop game and cleanup garbage
    const stopGame = () => {
        closeGame(gameId)
        removeCookie("gameId")
        removeCookie("hostId")
        props.history.push('/')
    }

    const startGame = (event) => {
        // move to start game push
        // props.history.push({ pathname: "/start-game", state: { gameId } })
        event.preventDefault()
        GameApiClient.request("/game/start_game", { gameId })
            .then(resp => resp.json()).then((data) => {
                if (!isNil(data.error_message)) {
                    console.log(data.error_message)
                    setErrAlertElement(data.error_message)
                }

            })
        // signal to all the other clients in the same socket that game has started
        // mySocket.emit("game-started", gameId)
    }

    mySocket.on("start-game", (data) => {
        //change the page to start-game with your socid to refer back to and gameId
        props.history.push({ pathname: "/start-game", state: data })
    })

    const setUsernameInSession = (username) => {
        mySocket.emit("set-username", {username: username})
    }

    const addPlayerToGame = (username, gameId) => {
        mySocket.emit("add-username-to-game", ({username: username, gameId: gameId}))
    }
    //============ Hooks ============
    useEffect(() => {


        /**
         * TODO: Implemenet the following tasks for getting the host part running
         * 1. Following data will be saved in session, for the ws server to help with communication 
         * - Check if game exist, otherwise create game, gameId should be stored in session and in global state => done
         * - Take username and save in the session on server side => done
         * - Take current client socId and save on server session => done
         *
         * 2. following are needed to start game
         * - attach the host username and add to game store => (in progress)
         * - show playerLists in current host menu
         * - join correct game on start game
         */

        getGameIdOtherwiseCreateAndGet().then(gameId => setGameId(gameId))
        getPlayerUsername().then(username=>setPlayerId(username))

        if (gameId && playerId) {
            // TODO gameId is found in session, 
            setUsernameInSession(playerId)
            addPlayerToGame(playerId, gameId)

        }



        // mySocket.on("player-id", function (id) {
        //     setCookie("hostId", id, { expires: new Date(new Date().getTime() + 60000) })

        // save playerId into context
        //     setPlayerId(id)
        // })


        // --- Preparing game config before starting of game ---- 
        // Player has not hosted any game at the moment
        // if (!cookies.gameId || !cookies.hostId || cookies.gameId === "undefined") {
        // create the game

        // TODO trying to generate gameId and then see if it saved in server side session
        // createNewGameId.then(() => {
        // setCookie("gameId", resp.data.gameId, { expires: new Date(new Date().getTime() + 8.64e+7) /**expire gameId after a day just incase*/ })
        // mySocket.emit("add-username-to-game", ({username: playerId, gameId: cookies.gameId}))

        // console.log('gameId', getCurrentGameId())
        // getGameIdOtherwiseCreateAndGet().then(gameId=>setGameId(gameId))
        // if(gameId){
        //     // TODO gameId is found in session, 
        // }

        // joinGame(resp.data.gameId, 0)

        // make sure to set local host-id
        // mySocket.emit("get-id", {})

        // refresh the component to refresh the player list
        // props.history.go('0'))
        // When player is not in any game

        // }) .catch(error=>console.log(error))
        // }
        // else if (cookies.hostId) {
        //     setGameId(cookies.gameId)
        //     if (cookies.gameId) {
        //         mySocket.emit("update-host-id", cookies.gameId)
        //         joinGame(cookies.gameId);

        //         // listen to player-list event
        //         mySocket.on("players-list", function (listOfPlayers) {
        //             // TODO if listOfPlayers is null, then don't set jsx, and remove all hostRelated cookies
        //             // only update players if there is new players being added
        //             //console.log("fetched player list ")
        //             if (listOfPlayers.length === 0) {
        //                 removeCookie("hostId")
        //                 // removeCookie("gameId")
        //                 removeCookie("connect.sid")
        //                 removeCookie("io")
        //             }
        //             setPlayersJSX(listOfPlayers)


        //         })
        //         mySocket.emit("find-players-list", gameId);


        //     }


        // }



    }, [gameId, setGameId, cookies, setCookie, removeCookie, props.history, setPlayerId, errAlertElement])



    const copyToClipboard = () => {
        navigator.clipboard.writeText(gameId)
    };

    return (

        <HostContainer>
            <Heading>Host Game</Heading>
            <SubHeading>host game for your friends to join game</SubHeading>
            <GameId><IconKey /><span>GameId: </span> <span style={{ color: "black" }}>{gameId}</span><IconClipBoard style={{ cursor: "pointer" }} onClick={copyToClipboard} /></GameId>
            <ErrorAlert style={{ display: errAlertElement ? "block" : "none" }}>{errAlertElement}</ErrorAlert>
            <PLayersListWrapper>{playersInLobby}</PLayersListWrapper>
            <OptionsContainer>
                <MainOption to="#" onClick={(event) => startGame(event)}>Start Game</MainOption>
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