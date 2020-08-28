import React, { useState, useMemo } from 'react';
import Index from './components';
import Host from './components/options/host';
import Guest from './components/options/guest';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import GameScreen from './components/game-screen';

export var AppContext = React.createContext('App')
// App Component
export default function App() {

    const [playerId, setPlayerId] = useState(null)
    return (
        <Router>
            <Switch>
                <AppContext.Provider value={{ playerId, setPlayerId }}>
                    <Route path="/" exact component={Index} />
                    <Route path="/host-game" exact component={Host} />
                    <Route path="/start-game" exact component={GameScreen} />
                    <Route path="/join-game" exact component={Guest} />
                </AppContext.Provider>
            </Switch>
        </Router>
    )
}

