import React, {useState} from 'react'
import { useCookies } from 'react-cookie'
import {useStateWithPromise} from './common/helpers/react-custom-hooks'

export const GlobalContext = React.createContext('Global')

export default function AppContext(props) {
    // define all state handlers here
    const [cookies, setCookie, removeCookie] = useCookies(["cookie-name"])
    const [playerId, setPlayerId] = useStateWithPromise(null)
    const [gameId, setGameId] = useState(null)

    // include all the states you want to expose in the entire app
    const GlobalValuesToBeIncludedInContextProvider = {
        cookies,
        setCookie,
        removeCookie,
        playerId,
        setPlayerId,
        gameId,
        setGameId
    }
    return <GlobalContext.Provider value={GlobalValuesToBeIncludedInContextProvider}>
        {props.children}
    </GlobalContext.Provider>
}