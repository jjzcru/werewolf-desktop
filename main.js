const { app, BrowserWindow, Menu, globalShortcut, dialog } = require('electron')
const path = require('path')
const url = require('url')
class App {
    constructor() {
        this.displayMenu = false;
        this.menuTemplate = [{
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
    }

    test() {
        console.log("i work");
    }

    run() {
        this.test()
        app.on('ready', function() {
            console.log(this);
            this.win = new BrowserWindow({ width: 400, height: 800 });
            this.win.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }))

            Menu.setApplicationMenu(null);

            globalShortcut.register('CommandOrControl+Space', function() {
                this.toggleMenu()
            })

            globalShortcut.register('CommandOrControl+N', () => {
                dialog.showMessageBox({ type: 'info', message: 'Should create a new windows' })
            })

            globalShortcut.register('CommandOrControl+Q', () => {
                dialog.showMessageBox({ type: 'info', message: 'Should close current window' })
            })


            // Open the DevTools.
            // win.webContents.openDevTools()

            // Emitted when the window is closed.
            this.win.on('closed', () => {
                this.win = null
            })
        })

        // Quit when all windows are closed.
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
                this.createWindow()
            }
        })
    }


    createWindow() {
        console.log(`El this`);
        console.log(this);

    }


    toggleMenu() {
        if (displayMenu) {
            Menu.setApplicationMenu(null);
        } else {
            const menu = Menu.buildFromTemplate(menuTemplate);
            Menu.setApplicationMenu(menu);
        }
        displayMenu = !displayMenu;
    }

}

new App().run()
    /*
    // Keep a global reference of the window object, if you don't, the window will
    // be closed automatically when the JavaScript object is garbage collected.
    let win

    let displayMenu = false;

    const menuTemplate = [{
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

    function createWindow() {
        // Create the browser window.
        win = new BrowserWindow({ width: 400, height: 800 })

        // and load the index.html of the app.
        win.loadURL(url.format({
            pathname: path.join(__dirname, 'index.html'),
            protocol: 'file:',
            slashes: true
        }))

        Menu.setApplicationMenu(null);

        globalShortcut.register('CommandOrControl+Space', () => {
            toggleMenu()
        })

        globalShortcut.register('CommandOrControl+N', () => {
            dialog.showMessageBox({ type: 'info', message: 'Should create a new windows' })
        })

        globalShortcut.register('CommandOrControl+Q', () => {
            dialog.showMessageBox({ type: 'info', message: 'Should close current window' })
        })

        // win.setMenu(null);

        // Open the DevTools.
        // win.webContents.openDevTools()

        // Emitted when the window is closed.
        win.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            win = null
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


    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', createWindow)

    // Quit when all windows are closed.
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
    })*/

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.