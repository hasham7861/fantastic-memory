import React, { useState } from 'react';
import Index from './components';
import { Host, Guest, Instructions } from './components/GameMenu';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import GameScreen from './components/GameStarted/GameScreen';
import GameOver from './components/GameOver/GameOver';

export var AppContext = React.createContext('App')

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
                    <Route path="/game-over" exact component={GameOver}/>
                    <Route path="/instructions" exact component={Instructions}/>
                </AppContext.Provider>
            </Switch>
        </Router>
    )
}

