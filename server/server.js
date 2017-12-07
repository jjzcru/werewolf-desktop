const express = require('express')

module.exports = class Server {
    constructor(events, port, db) {
        this.events = events;
        this.port = port;
        this.db = db;
        this.app = express();
        this.running = false;
        this.server = null;
    }

    start() {
	    if(this.server === null) {
		    this.app.get('/', this.healthCheck)
		    this.app.get('/room/player', this.listPlayers)
		    this.server = this.app.listen(this.port, () => {
			    console.log(`Server running on port: ${this.port}`)
		    });
	    }
    }

    isRunning() {
    	return this.running
    }

    stop() {
	    if(this.server !== null) {
		    this.server.close();
	    }

    }

    healthCheck(req, res) {
        res.send({
            healthy: true
        });
    }

    listPlayers(req, res) {
		this.db.getPlayers()
		.then(players => {
			res.send(players);
		})
	    .catch(err=> {
	    	res.status(500).send({error: err});
	    })
    }


}

/*var events = require('events');
var eventEmitter = new events.EventEmitter();

var ringBell = function ringBell()
{
	console.log('ring ring ring');
}
eventEmitter.on('doorOpen', ringBell);

eventEmitter.emit('doorOpen');*/