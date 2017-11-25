const uuidv4 = require('uuid/v4')
const loki = require('lokijs')
    // uuidv4();
module.exports = class DB {
    constructor() {
        this.db = new loki('Werewolf');
        this.connectionDB = this.db.addCollection('connection', {
            unique: ["ConnectionID"]
        });
        this.playerDB = this.db.addCollection('player', {
            unique: ["PlayerID"]
        });
    }

    async addPlayer(player) {
        return new Promise((resolve, reject) => {
            try {
                let response = [];
                if (Array.isArray(player)) {
                    let players = player;
                    players.forEach(player => {
                        let cached = this.playerDB.findObject(player);
                        if (cached) {
                            this.playerDB.update(player);
                        } else {
                            this.playerDB.insert(player)
                        }
                        response.push(player);
                    });
                } else {
                    let cached = this.playerDB.findObject(player);
                    if (cached) {
                        this.playerDB.update(player);
                    } else {
                        this.playerDB.insert(player)
                    }
                    response = player;
                }
                resolve(response);
            } catch (e) {
                reject(e);
            }
        });
    }

    async getPlayer(PlayerID) {
        return new Promise((resolve, reject) => {
            try {
                let results = this.playerDB.find({ PlayerID: PlayerID });
                resolve(results);
            } catch (e) {
                reject(e);
            }
        });
    }

    async getPlayers() {
        return new Promise((resolve, reject) => {
            try {
                let results = this.playerDB.find();
                resolve(results);
            } catch (e) {
                reject(e);
            }
        });
    }

    async addConnection(connection) {
        return new Promise((resolve, reject) => {
            try {
                let response = [];
                if (Array.isArray(connection)) {
                    let connections = connection;
                    connections.forEach(connection => {
                        let cached = this.connectionDB.findObject(connection);
                        if (cached) {
                            this.connectionDB.update(connection);
                        } else {
                            this.connectionDB.insert(connection)
                        }
                        response.push(connection);
                    });
                } else {
                    let cached = this.connectionDB.findObject(connection);
                    if (cached) {
                        this.connectionDB.update(connection);
                    } else {
                        this.connectionDB.insert(connection)
                    }
                    response = connection;
                }
                resolve(response);
            } catch (e) {
                reject(e);
            }
        });
    }

    async getConnection(ConnectionID) {
        return new Promise((resolve, reject) => {
            try {
                let results = this.connectionDB.find({ ConnectionID: ConnectionID });
                resolve(results);
            } catch (e) {
                reject(e);
            }
        });
    }

    async getConnections() {
        return new Promise((resolve, reject) => {
            try {
                let results = this.connectionDB.find();
                resolve(results);
            } catch (e) {
                reject(e);
            }
        });
    }
}