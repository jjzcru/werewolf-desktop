const express = require('express')
const app = express()
const DB = require('./db');

let db = new DB();

function getPlayers(req, res) {
    db.connectionDB()
}

module.exports = {
    start(port, window) {
        app.get('/', (req, res) => res.send('Hello World!'))

        app.listen(port, () => console.log(`Server running on port: ${port}`))
    }
}