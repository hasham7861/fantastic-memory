const { assert } = require('chai')
const Game = require('../../../base/game/game.model')

describe('Game', async function () {
    it('generated gameId string length greater than 0', async function () {
        const newGeneratedGameId = await Game.getGeneratedGameId()
        assert.isTrue(newGeneratedGameId.length > 0)
    })

    it('input gameId length is string and length is equal to 8', function(){
        const randomGameIdWith8Chars = '23232232'
        const isValidGameId = Game.isValidGame(randomGameIdWith8Chars)
        assert.isTrue(isValidGameId)
    })
})