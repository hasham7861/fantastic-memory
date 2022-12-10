/**
 * Required to have some sort of mongodb server running and exposed to current machine
 * Create fantastic-memory-test DB
 * Inside the script create games and playertogames tables
 * Insert test data in both
 */
const { MongoClient } = require('mongodb')


const mongoClient = MongoClient('mongodb://localhost:27017/', { useUnifiedTopology: true })

mongoClient
    .connect(async function (err, client) {
        if (err) throw err

        const db = client.db("fantastic_memory_test");

        await db.collection('games').insertOne(
            {
                "gameId": "07deb6f5",
                "game": {
                    "gameId": "07deb6f5",
                    "players": {},
                    "status": "MENU",
                    "hostId": "/game-nsp#7XEPhDhI4P3BNk1HAAAA",
                    "playerTurnId": "/game-nsp#7XEPhDhI4P3BNk1HAAAA",
                    "playerTurnIndex": 0,
                    "gameRounds": [{}, {}, {}],
                    "currentGameRound": 1, "totalRounds": 3,
                    "timeForEachRound": 30000
                },
            }
        )

        await db.collection('playertogames').insertOne(
            {
                "playerId": "/game-nsp#7XEPhDhI4P3BNk1HAAAA",
                "gameId": "07deb6f5"
            }
        )

        console.log('should have finished creating the test db')
        mongoClient.close()
    })
