const { app, BrowserWindow, Menu, globalShortcut, dialog, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const os = require('os');
const portastic = require('portastic');
const networkInterfaces = os.networkInterfaces();
const Server = require('./server/Server')
const Client = require('./server/client')

let displayMenu = false;
let mainWindow = {};

const playerNamesArray = [
    "Galileo",
    "William ",
    "Hans",
    "Johannes",
    "John",
    "Willebrord",
    "Nicolaus",
    "William",
    "Rene",
    "Blaise",
    "Thomas",
    "Christiaan",
    "Pierre",
    "Jan",
    "Otto",
    "Robert",
    "Robert",
    "James",
    "Leonardo",
    "Isaac",
    "John",
    "Hennig",
    "Antony",
    "Christiann",
    "Gottfried",
    "Leonardo",
    "Leonhard",
    "Louis",
    "Marie",
    "Albert",
    "Jane",
    "Maria",
    "Rachel",
    "Rosalind",
    "Barbara",
    "Gertrude",
    "Elizabeth",
    "Joy",
    "Maria",
    "Mary",
    "Virginia",
    "Elizabeth",
    "Clara",
    "Florence",
    "Ruth",
    "Elizabeth"
]

const playerLastNamesArray = [
    "Galilei ",
    "Gilbert",
    "Lippershey",
    "Kepler",
    "Napier",
    "Snell",
    "Cabeus",
    "Oughtred",
    "Descartes",
    "Pascal",
    "Bartholin",
    "Huygens",
    "de Fermat",
    "Swammerdam",
    "von Guericke",
    "Hooke",
    "Boyle",
    "Gregory",
    "Da Vinci",
    "Newton",
    "Wallis",
    "Brand",
    "van Leeuwenhoek",
    "Huygens",
    "Leibniz",
    "Fibonacci",
    "Euler",
    "Pasteur",
    "Curie",
    "Einstein",
    "Goodall",
    "Mayer",
    "Carson",
    "Franklin",
    "Mcclintock",
    "Elion",
    "Blackwell",
    "Adamson",
    "Agnesi",
    "Anning",
    "Apgar",
    "Arden",
    "Barton",
    "Bascom",
    "Benedict",
    "Britton"
]

let menuTemplate = [{
    label: 'File',
    submenu: [{
        label: 'New',
        accelerator: 'Ctrl + N',
        click: () => {
            console.log('About Clicked');
        }
    }, {
        label: 'Close',
        accelerator: 'Ctrl + Q',
        click: () => {
            // app.quit();
            mainWindow.close();
        }
    }]
}, {
    label: 'View',
    submenu: [{
        label: 'Plus Petit',
        accelerator: 'Ctrl + 1',
        click: () => {
            windowSmaller()
        }
    }, {
        label: 'Petit',
        accelerator: 'Ctrl + 2',
        click: () => {
            windowSmall()
        }
    }, {
        label: 'Normal',
        accelerator: 'Ctrl + 3',
        click: () => {
            windowRegular()
        }
    }, {
        label: 'Grand',
        accelerator: 'Ctrl + 4',
        click: () => {
            windowsBig()
        }
    }]
}];

function start() {
    app.on('ready', createWindow)

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
        if (win === null) {
            createWindow()
        }
    })
}


function createWindow() {
    mainWindow = new BrowserWindow({
        width: 400,
        height: 800,
        resizable: true,
        fullscreen: false,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    mainWindow.webContents.openDevTools()


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
        goToCreateRoom: function() {
            mainWindow.global.playerName = getRandomName();
            getOpenPort()
                .then((port) => {
                    mainWindow.global.port = port;
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'views', 'create-game.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                })
                .catch(err => console.log(err));

        },
        goToIndex: function() {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'views', 'index.html'),
                protocol: 'file:',
                slashes: true
            }));
        },
        goToJoinRoom: function() {
            getOpenPort()
                .then((port) => {
                    mainWindow.global.port = port;
                    mainWindow.global.playerName = getRandomName();
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'views', 'join-game.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                })
                .catch(err => console.log(err));
        },
        joinRoom: function(player, host, port) {
            console.log(`Player: ${player}`);
            console.log(`Host: ${host}`);
            console.log(`Port: ${port}`);

            mainWindow.server = new Server(mainWindow, mainWindow.global.port);
            try {
                mainWindow.server.start();
            } catch (e) {
                console.log(e);
                mainWindow.server.stop()
            }


            mainWindow.global.client.setHost(host, port);
            mainWindow.global.client.joinRoom(mainWindow.global.port, player)
                .then(response => {
                    console.log(response);
                })
                .catch(err => {
                    console.log("Llegue al error");
                    console.log(err);
                })
        }
    }
    mainWindow.createServer = () => {
        mainWindow.server = new Server(mainWindow, mainWindow.global.port);
        mainWindow.server.start();
    }
}

function getRandomName() {
    let randomIndex = Math.floor(Math.random() * playerNamesArray.length);
    let name = playerNamesArray[randomIndex];
    randomIndex = Math.floor(Math.random() * playerLastNamesArray.length);
    let lastName = playerLastNamesArray[randomIndex];
    return `${name} ${lastName}`;
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