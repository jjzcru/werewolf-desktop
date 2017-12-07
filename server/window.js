const path = require('path');
const fs = require('fs');
const os = require('os');
const events = require('events');

const url = require('url')
const uuidv4 = require('uuid/v4')
const portastic = require('portastic');

const {app, BrowserWindow, Menu, globalShortcut, dialog, ipcRenderer} = require('electron')

const {menuTemplate, getRandomName} = require('./config');
const Server = require('./server')
const Client = require('./client')
const DB = require('./db')

const networkInterfaces = os.networkInterfaces();
module.exports = class Window {
	constructor(nodeType, width, height) {
		this.width = 400;
		this.height = 800;
		this.ip = this.getIpAddress();
		this.port = 0;
		this.playerName = '';
		this.stack = [];
		this.db = new DB();
		this.nodeType = nodeType;
		this.window = new BrowserWindow({
			width     : this.width,
			height    : this.height,
			resizable : false,
			fullscreen: false,
		});

		// this.window.webContents.openDevTools()

		this.window.global = {
			port      : 0,
			playerName: '',
			ip        : ''
		};

		this.window.actions = {
			back: () => {
				this.back();
			},
			createRoom: (ip, port, playerName) => {
				this.createRoom(ip, port, playerName);
			}
		}

		this.getOpenPort()
		.then(port => {
			this.port = port;
			this.playerName = getRandomName();
			this.window.global.port = this.port;
			this.window.global.playerName = this.playerName;
			this.window.global.ip = this.getIpAddress();
			if (nodeType === 'master') {
				this.window.loadURL(url.format({
					pathname: path.join(__dirname, '..', 'views', 'create-game.html'),
					protocol: 'file:',
					slashes : true
				}));
			} else {
				this.window.loadURL(url.format({
					pathname: path.join(__dirname, '..', 'views', 'join-game.html'),
					protocol: 'file:',
					slashes : true
				}));
			}
		})
		.catch(err => console.log(err));
	}

	back() {
		console.log(path.join(__dirname, '..', 'views', 'create-game.html'));
		/*let view = '';
		if(this.stack.length === 0) {
			this.window.close();
		} else {
			this.stack.pop();
			view = this.stack[this.stack.length - 1];
		}

		this.window.loadURL(url.format({
			pathname: path.join(__dirname, '..', 'views', 'create-game.html'),
			protocol: 'file:',
			slashes: true
		}))*/
	}


	createRoom(ip, port, playerName) {
		this.playerName = playerName;
		this.events = new events.EventEmitter();
		this.server = new Server(this.events, port, this.db);

		this.server.start();

		const connection = {
			ConnectionID: uuidv4(),
			ip: ip,
			port: port,
			type: 'master',
			lock: false
		};

		let player = {
			PlayerID: uuidv4(),
			ConnectionID: connection.ConnectionID,
			name: playerName,
			class: '',
			role: '',
			alive: true
		};

		this.db.addConnection(connection)
		.then(() => this.db.addPlayer(player))
		.then(() => {
			this.window.global.ConnectionID = player.ConnectionID;
			this.window.global.PlayerID = player.PlayerID;
			this.window.global.playerName = player.name;
			this.window.global.players = [];
			this.stack.push('list-players');
			this.window.loadURL(url.format({
				pathname: path.join(__dirname, '..', 'views', 'list-players.html'),
				protocol: 'file:',
				slashes: true
			}));
		})
		.catch(err=>console.log(err));
	}

	joinRoom(host, port, playerName) {

	}

	getWindow() {
		return this.window;
	}

	getIpAddress() {
		return networkInterfaces['Wi-Fi'][0]['address'];
	}

	getOpenPort() {
		return new Promise((resolve, reject) => {
			let lowerPort = 8000;
			let higherPort = 8100;
			portastic.find({
				min: lowerPort,
				max: higherPort
			})
			.then(ports => {
				let randomIndex = Math.round(Math.random() * (ports.length - 0) + 0);
				let port = ports[randomIndex];
				resolve(port);
			})
			.catch(err => {
				reject(err);
			});
		})
	}
}