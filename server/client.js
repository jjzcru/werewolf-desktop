const unirest = require('unirest');

module.exports = class Client {
    constructor() {
        this.baseUrl = '';
    }

    setHost(host, port) {
        this.baseUrl = `http://${host}:${port}`;
    }

    async healthCheck() {
        return new Promise((resolve, reject) => {
            unirest.get(this.baseUrl + '/')
                .end(function(response) {
                    let status = response.status;;
                    if (status >= 200 && status < 400) {
                        console.log(`Status: ${status}`);
                        resolve(response.body)
                    } else {
                        reject(response.body);
                    }
                });
        })
    }

    async joinRoom(player, port) {
        return new Promise((resolve, reject) => {
            unirest.post(this.baseUrl + '/room/join')
                .headers({
                    'Content-Type': 'application/json'
                })
                .send({
                    name: player,
                    mac: '',
                    port: port
                })
                .end(function(response) {
                    let status = response.status;;
                    if (status >= 200 && status < 400) {
                        console.log(`Status: ${status}`);
                        resolve(response.body)
                    } else {
                        reject(response.body);
                    }
                });
        });
    }
}