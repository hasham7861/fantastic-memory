const { describe, it } = require('mocha')
const { assert } = require('chai')
const {Game} = require('../../../../base/game/game.model')

describe('Testing Game Modal', async function () {
    it('generated gameId string length greater than 0', async function () {
        const newGeneratedGameId = await Game.getGeneratedGameId()
        assert.isTrue(newGeneratedGameId.length > 0)
    })
})