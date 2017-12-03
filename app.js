const events = require('events');
const { app, BrowserWindow, Menu, globalShortcut, dialog, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const os = require('os');
const portastic = require('portastic');
const uuidv4 = require('uuid/v4')
const networkInterfaces = os.networkInterfaces();
const Server = require('./server/server')
const Client = require('./server/client')
const {  menuTemplate, getRandomName } = require('./config');
const DB = require('./server/db')

let displayMenu = false;
let mainWindow = {};
let rooms = [];

function start() {
    app.on('ready', createMainWindow)

    app.on('window-all-closed', () => {
        // On macOS it is common for applications and their menu bar
        // to stay active until the user quits explicitly with Cmd + Q
        if (process.platform !== 'darwin') {
            app.quit()
        }
    })

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (mainWindow === null) {
            createMainWindow()
        }
    })
}


function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        resizable: true,
        fullscreen: false,
    });

    mainWindow.stack = [];

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.db = new DB();

    // mainWindow.webContents.openDevTools()

    mainWindow.webContents.on('did-finish-load', function() {
        fs.readFile(path.join(__dirname, 'views', 'style.css'), 'utf-8', function(error, data) {
            if (!error) {
                var formatedData = data.replace(/\s{2,10}/g, ' ').trim()
                mainWindow.webContents.insertCSS(formatedData)
            }
        })
    });

    Menu.setApplicationMenu(null);
    loadShortcuts()

    mainWindow.on('closed', () => {
        mainWindow = null
    });

    mainWindow.global = {
        playerName: getRandomName(),
        ip: getIpAddress(),
        client: new Client()
    };

    mainWindow.actions = {
        back: function() {
            let view = '';
            mainWindow.stack.pop();
            if (mainWindow.stack.length > 0) {
                view = mainWindow.stack[mainWindow.stack.length - 1];
            } else {
                view = 'index'
            }

            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'views', `${view}.html`),
                protocol: 'file:',
                slashes: true
            }));
        },
        goToCreateRoom: function() {
            getOpenPort()
                .then((port) => {
                    mainWindow.global.port = port;
                    mainWindow.global.playerName = getRandomName();
                    mainWindow.stack.push('create-game');
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'views', 'create-game.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                })
                .catch(err => console.log(err));

        },
        goToJoinRoom: function() {
            getOpenPort()
                .then((port) => {
                    mainWindow.global.port = port;
                    mainWindow.global.playerName = getRandomName();
                    mainWindow.stack.push('join-game');
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'views', 'join-game.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                })
                .catch(err => console.log(err));
        },
        createRoom: function(name, port) {
            mainWindow.global.playerName = name;
            mainWindow.global.port = port;

            if (mainWindow.server === undefined) {
                mainWindow.server = new Server(mainWindow.events, port, mainWindow.db);
            }

            try {
                mainWindow.server.start();
            } catch (e) {
                console.log(e);
            }

            let connection = {
                ConnectionID: uuidv4(),
                ip: getIpAddress(),
                port: port,
                type: 'master',
                lock: false
            };

            let player = {
                PlayerID: uuidv4(),
                ConnectionID: connection.ConnectionID,
                name: name,
                class: '',
                role: '',
                alive: true
            };

            mainWindow.db.addConnection(connection)
                .then(() => mainWindow.db.addPlayer(player))
                .then(() => {
                    mainWindow.global.ConnectionID = player.ConnectionID;
                    mainWindow.global.PlayerID = player.PlayerID;
                    mainWindow.global.playerName = player.name;
                    mainWindow.global.players = [];
                    mainWindow.stack.push('list-players');
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'views', 'list-players.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                });
        },
        joinRoom: function(player, host, port) {
            mainWindow.server = new Server(mainWindow.events, mainWindow.global.port, mainWindow.db);
            try {
                mainWindow.server.start();
            } catch (e) {
                console.log(e);
                mainWindow.server.stop()
            }


            mainWindow.global.client.setHost(host, port);
            mainWindow.global.client.joinRoom(mainWindow.global.port, player)
                .then(response => {
                    console.log(`RESPONSE`);
                    console.log(response);
                    return mainWindow.db.addPlayer({
                        ConnectionID: response.ConnectionID,
                        PlayerID: response.PlayerID,
                        name: response.name,
                        class: '',
                        role: '',
                        alive: true
                    })
                })
                .then(player => {
                    mainWindow.global.ConnectionID = player.ConnectionID;
                    mainWindow.global.PlayerID = player.PlayerID;
                    mainWindow.global.playerName = player.name;
                    mainWindow.global.players = [];
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'views', 'list-players.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                })
                .catch(err => {
                    console.log("Llegue al error");
                    console.log(err);
                })
        }
    }
}

function getOpenPort() {
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

function getIpAddress() {
    return networkInterfaces['Wi-Fi'][0]['address'];
}

function loadShortcuts() {
    globalShortcut.register('CommandOrControl+Space', () => {
        toggleMenu()
    });

    globalShortcut.register('CommandOrControl+N', () => {
        dialog.showMessageBox({ type: 'info', message: 'Should create a new windows' })
    });

    globalShortcut.register('CommandOrControl+Q', () => {
        closeWindow()
    });

    globalShortcut.register('CommandOrControl+1', () => {
        windowSmaller()
    });

    globalShortcut.register('CommandOrControl+2', () => {
        windowSmall()
    });

    globalShortcut.register('CommandOrControl+3', () => {
        windowRegular()
    });

    globalShortcut.register('CommandOrControl+4', () => {
        windowsBig()
    });
}

function toggleMenu() {
    if (displayMenu) {
        Menu.setApplicationMenu(null);
    } else {
        const menu = Menu.buildFromTemplate(menuTemplate);
        Menu.setApplicationMenu(menu);
    }
    displayMenu = !displayMenu;
}

function windowSmaller() {
    mainWindow.setSize(200, 400)
}

function windowSmall() {
    mainWindow.setSize(300, 600)
}

function windowRegular() {
    mainWindow.setSize(400, 800)
}

function windowsBig() {
    mainWindow.setSize(500, 1000)
}

function closeWindow() {
    mainWindow.close()
}


module.exports = start;