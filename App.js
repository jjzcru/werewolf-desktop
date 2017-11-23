const { app, BrowserWindow, Menu, globalShortcut, dialog, ipcRenderer } = require('electron')
const path = require('path')
const fs = require('fs')
const url = require('url')

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
            app.quit();
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
        /*resizable: false,
        fullscreen: false,*/
    });
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'views', 'index.html'),
        protocol: 'file:',
        slashes: true
    }));
    mainWindow.webContents.openDevTools()
    mainWindow.webContents.on('did-finish-load', function() {
        fs.readFile(path.join(__dirname, 'views', 'style.css'), "utf-8", function(error, data) {
            if (!error) {
                var formatedData = data.replace(/\s{2,10}/g, ' ').trim()
                mainWindow.webContents.insertCSS(formatedData)
            }
        })
    })

    Menu.setApplicationMenu(null);
    loadShortcuts()

    mainWindow.on('closed', () => {
        win = null
    })
}

function loadShortcuts() {
    globalShortcut.register('CommandOrControl+Space', function() {
        toggleMenu()
    })

    globalShortcut.register('CommandOrControl+N', () => {
        dialog.showMessageBox({ type: 'info', message: 'Should create a new windows' })
    })

    globalShortcut.register('CommandOrControl+Q', () => {
        dialog.showMessageBox({ type: 'info', message: 'Should close current window' })
    })

    globalShortcut.register('CommandOrControl+1', () => {
        mainWindow.setSize(200, 400)
    })

    globalShortcut.register('CommandOrControl+2', () => {
        mainWindow.setSize(300, 600)
    })

    globalShortcut.register('CommandOrControl+3', () => {
        mainWindow.setSize(400, 800)
    })

    globalShortcut.register('CommandOrControl+4', () => {
        mainWindow.setSize(500, 1000)
    })
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

module.exports = start;