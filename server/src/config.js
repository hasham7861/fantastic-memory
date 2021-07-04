export default {
    "PORT":5000,
    "AllowedOrigins": [
        "http://localhost:3000",
        "http://localhost:5000"
    ],
    "SESSION_CONF":{
        "SECRET":"ooga-booga-potato",
        "MAX_AGE": 300000
    },
    // WARNING: This dev db is exposed on purpose as this is a pen project
    "DbDevUri":"mongodb+srv://fantastic_dev_user:Gr0Lc1I7G2dYb9XL@gartechcluster.yzune.mongodb.net/fantasy-memory-dev"
}
