import React, { useEffect, useState } from 'react';
import { mySocket } from '../../services/game-sockets'
import { withRouter, Link, useHistory } from 'react-router-dom'
import { isEmpty, isNil } from 'ramda'
import styled from 'styled-components'
import { useCookies } from 'react-cookie'

const GameOver = (props) => {

    const [playerListJSX, updatePlayerListJSX] = useState([])
    const [cookies, removeCookie] = useCookies(["cookie-name"])
    const history = useHistory()

    mySocket.on("load-players-list", ({ players, currentPlayerId }) => {
        updatePlayerListJSX(formatPlayersToJSX(players, currentPlayerId))
    })

    const formatPlayersToJSX = (players, currentPlayerId) => {
        if (isNil(players))
            return

        const playersList = Object.keys(players).reduce((list, playerId) => {
            list.push(players[playerId])
            return list
        }, [])

        const playersListToJSX = playersList.map((player, index) => {
            return <li key={index}>
                <p style={{ color: "#3D2175", fontSize: "1.2rem", wordBreak: "break-word" }}>${player.id}</p>
                <p>Points {player.points}</p>
            </li>
        })

        return playersListToJSX

    }
    useEffect(() => {
        if (isNil(cookies.gameId)) {
            history.push("/")
        }
        if (isEmpty(playerListJSX)) {
            mySocket.emit("get-players-and-score", cookies.gameId)
        }
    })


    const goToMenu = (e) => {
        e.preventDefault()
        removeCookie("gameId")
        removeCookie("hostId")
        props.history.push("/")
    }
    return <GameOverContainer>
        {/* TODO: Make the game over screen a bit more dynamic */}
        <Heading>GameOver</Heading>
        <PlayersInLobbyWrapper>
            {playerListJSX}
        </PlayersInLobbyWrapper>
        <Option to="/" onClick={(e) => goToMenu(e)}>Return to Menu</Option>
    </GameOverContainer>
}

export default withRouter(GameOver);

const GameOverContainer = styled.div`
    display:flex;
    width: 100%;
    height: 800px;
    justify-content: center;
    align-items: center;
    flex-direction: Column;
`
const Heading = styled.h1`
    color:#3D2175;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 4rem;
    line-height:0;
    margin-bottom:80px;
`

const PlayersInLobbyWrapper = styled.ul`
    width:500px;
    height:200px;
    background-color: #f1def1;
    font-family: Helvetica, Arial, sans-serif;
    color:#3D2175;
    border-radius:20px;
    margin-bottom:30px;
    list-style:none;
`

const Option = styled(Link)`
    border: 1px solid #3D2175;
    padding: 10px 30px;
    margin: 5px;
    border-radius: 20px;
    text-decoration: none;
    color: #3D2175;
`

