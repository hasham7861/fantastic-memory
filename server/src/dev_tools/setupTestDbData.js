/**
 * Required to have some sort of mongodb server running and exposed to current machine
 * Create fantastic-memory-test DB
 * Inside the script create games and playertogames tables
 * Insert test data in both
 */
const { MongoClient } = require('mongodb')


const mongoClient = MongoClient('mongodb://localhost:27017/fantastic_memory_test', { useUnifiedTopology: true })

mongoClient
    .open(async (err, db) => {
        if (err) throw err

        await db.games.insertOne(
            {
                "_id":
                    { "$oid": "602843c3ebb80f6ddce3b073" },
                "createdAt": { "$date": "2021-02-13T21:25:18.269Z" },
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
                "__v": 0
            }
        )

        await db.playertogames.insertOne(
            {
                "_id": {
                    "$oid": "6028272fa3966204031f1c61"
                },
                "playerId": "/game-nsp#7XEPhDhI4P3BNk1HAAAA",
                "__v": 0,
                "gameId": "07deb6f5"
            }
        )

        console.log('should have finished creating the test db')
        mongoClient.close()

    })
    .catch(() => {
        console.log('unable to connect to db')
        mongoClient.close()
    })

