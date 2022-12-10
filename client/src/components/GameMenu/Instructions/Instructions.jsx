import React from 'react'
import { withRouter } from 'react-router-dom'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

function Instructions() {
    return (
        <InstructionsContainer>
            <Heading>Instructions</Heading>
            <DescriptionsWrapper>Fantastic Memory is a guess the drawing in multiplayer game. Two main game modes: Host Game and Join Game. Host Game means you can share your gameId with your friends to join. Then Join Game means you can join your friend’s game with the gameId they have provided you with.  </DescriptionsWrapper>
            <Option to="/">Return Home</Option>
        </InstructionsContainer>
    )
}

const InstructionsContainer = styled.div`
    display:flex;
    width: 100%;
    height: 800px;
    justify-content: center;
    align-items: center;
    flex-direction: Column;
    color: blue;
`
const Heading = styled.h1`
    color:#3D2175;
    font-family: Helvetica, Arial, sans-serif;
    font-size: 4rem;
    line-height:0;
    margin-bottom:80px;
`

const DescriptionsWrapper = styled.div`
    width:500px;
    height:200px;
    background-color: #f1def1;
    font-family: Helvetica, Arial, sans-serif;
    color:#3D2175;
    font-size:1.5rem;
    border-radius:20px;
    padding:50px;
    margin-bottom:30px;
`

const Option = styled(Link)`
    border: 1px solid #3D2175;
    padding: 10px 30px;
    margin: 5px;
    border-radius: 20px;
    text-decoration: none;
    color: #3D2175;
`

export default withRouter(Instructions)