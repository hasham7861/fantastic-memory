import React, { useState } from 'react'
export const GlobalContext = React.createContext('Global')
export default function AppContext(props) {
    // define all state handlers here
    const [playerId, setPlayerId] = useState(null)
    // include all the states you want to expose in the entire app
    const GlobalValuesToBeIncludedInContextProvider = {
        playerId,
        setPlayerId
    }
    return <GlobalContext.Provider value={GlobalValuesToBeIncludedInContextProvider}>
        {props.children}
    </GlobalContext.Provider>
}