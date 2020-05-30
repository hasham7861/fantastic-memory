import React from 'react';
import { isServerUp, envUri } from '../../util/server';

import DrawingBoard from './drawing-board';

const getGameToken = async () => {
    return axios.get(envUri + "/game/generate_game_id").then(data => data).catch(err => {
        return null
    });
};

export default function () {
    return (<div>Host</div>)
}