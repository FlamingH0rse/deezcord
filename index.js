const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')

let mainWindow

const createWindow = () => {
    mainWindow = new BrowserWindow({
        backgroundColor: '#202225',
        width: 1000,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        titleBarStyle: 'hidden',
        fullscreenable: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    mainWindow.loadFile('./frontend/app/app.html')
}

app.whenReady().then(async () => {
    createWindow()

    ipcMain.handle('backend', (event, d) => {
        //client related stuff
        if (d.title == 'minimizeWin') mainWindow.minimize()
        else if (d.title == 'maximizeWin') {
            // ❐ Maximized ☐ Normal
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
                return { title: 'unMaximized' }
            } else {
                mainWindow.maximize();
                return { title: 'maximized' }
            }
        }
        else if (d.title == 'closeWin') mainWindow.close()
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

process.on('uncaughtException', err => {
    console.log(err)
})

process.on('unhandledRejection', err => {
    console.log(err)
})