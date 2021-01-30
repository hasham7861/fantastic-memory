import React, { useEffect } from 'react';
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import { initiateGameSockets } from '../services/game-sockets';
import GameLogo from '../images/logo.png'

initiateGameSockets.then(data => data);

export default function () {
    useEffect(() => {

    })

    return (
        <SplashPageContainer>
            <img src={GameLogo} alt="game-logo" width="100px"></img>
            <Heading>Fantastic Memory</Heading>
            <SubHeading>draw and your friends will guess your drawing</SubHeading>
            <OptionsContainer>
                <MainOption to="/join-game">Join Game</MainOption>
                <Option to="/host-game">Host Game</Option>
                <Option to="/instructions">Instructions</Option>
            </OptionsContainer>
        </SplashPageContainer>
    )
}

const SplashPageContainer = styled.div`
    display:flex;
    width: 100%;
    height: 700px;
    justify-content: center;
    align-items: center;
    flex-direction: Column;
`;

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

const OptionsContainer = styled.div`
    display: flex;
    flex-direction: Column;
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