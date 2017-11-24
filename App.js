const { app, BrowserWindow, Menu, globalShortcut, dialog, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')
const os = require('os');
const portastic = require('portastic');
const networkInterfaces = os.networkInterfaces();
const server = require('./server/server')
const Client = require('./server/client')
const DB = require('./server/db')

let displayMenu = false;
let mainWindow = {};

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
        resizable: false,
        fullscreen: false,
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));

    // mainWindow.webContents.openDevTools()
    getOpenPort();

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
        playerName: 'Mary Elion',
        ip: getIpAddress()
    };

    mainWindow.createServer = () => {
        server.start(mainWindow.global.port, mainWindow);
    }
}

function getOpenPort() {
    let lowerPort = 4000;
    let higherPort = 9000;
    portastic.find({
            min: lowerPort,
            max: higherPort
        })
        .then(ports => {
            let randomIndex = Math.round(Math.random() * (ports.length - 0) + 0);
            let port = ports[randomIndex];
            let client = new Client();
            client.setHost('192.168.1.104', 3330);
            let db = new DB();
            client.joinRoom("blur blur", 4440).then(data => {
                console.log('Healthcheck');
            })
            mainWindow.global.port = port;
        });
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