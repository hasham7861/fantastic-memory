import React, { useState } from 'react'

export const AppContext = React.createContext('App')

const Store = ({ children }) => {

    const [appState, setAppState] = useState({state1:"test"})
  
    return (
        <AppContext.Provider value={[appState, setAppState]}>
            {/* Render all the children components */}
            {children}
        </AppContext.Provider>
    )
}

export default Store