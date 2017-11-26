const express = require('express')
const DB = require('./db');

module.exports = class Server {
    constructor(window, port) {
        this.window = window;
        this.port = port;
        this.db = new DB();
        this.app = express();
    }

    start() {
        let app = this.app;
        app.get('/', this.healthCheck)
        app.listen(this.port, () => {
            console.log(`Server running on port: ${this.port}`)
        });

        this.app = app;
    }

    stop() {
        this.app.close();
    }

    healthCheck(req, res) {
        res.send({
            healthy: true
        });
    }

    listPlayers(req, res) {

    }
}