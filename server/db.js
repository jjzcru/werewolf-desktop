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
                            var results = users.find({ ConnectionID: connection.ConnectionID });
                            console.log(results);
                        } else {
                            this.connectionDB.insert(connection)
                        }
                        response.push(connection);
                    });
                } else {
                    let cached = this.connectionDB.findObject(connection);
                    if (cached) {
                        this.connectionDB.update(connection);
                        var results = users.find({ ConnectionID: connection.ConnectionID });
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
}