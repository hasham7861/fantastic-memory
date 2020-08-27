import React, { useState } from 'react';
import Index from './components';
import Host from './components/options/host';
import Guest from './components/options/guest';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import GameScreen from './components/game-screen';

// App Component
export default function () {
    return (
        <Router>
            <Switch>
                <Route path="/" exact component={Index} />
                <Route path="/host-game" exact component={Host} />
                <Route path="/start-game" exact component={GameScreen} />
                <Route path="/join-game" exact component={Guest} />
            </Switch>
        </Router>
    )
}

