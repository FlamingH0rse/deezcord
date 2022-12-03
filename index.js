const botconfig = require('./config.json');
const savedcache = require('./cache.json')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

//discord:
const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions] });

const path = require('path')

let mainWindow

const createWindow = () => {
    console.log('Creating window...')
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

const connectDiscord = () => {
    return new Promise(res => {
        client.once('ready', () => {
            console.log('Connected to Discord');
            client.user.setActivity("DiscordForBots", {
                type: "PLAYING",
                url: "https://www.github.com/FlamingH0rse"
            });
            res()
        });
    })
}
app.whenReady().then(async () => {
    await connectDiscord()
    createWindow()
    ipcMain.handle('backend', (event, d) => {
        console.log(d)
        if (d.title == 'initInfo') {
            let res = {}
            res.user = [client.user.tag, client.user.displayAvatarURL()]
            res.guilds = client.guilds.cache.map(g => [g.name, g.id, g.iconURL()])
            if (savedcache.lastGuild.type == 'GUILD' && client.guilds.cache.get(savedcache.lastGuild.id)) {
                res.currentGuild = client.guilds.cache.get(savedcache.lastGuild.id)
            }
            return res
        }
        if (d.title == 'navGuild') {
            if (d.type == 'GUILD' && client.guilds.cache.get(d.id)) {
                return { title: 'navGuildSuccess', d: {
                    channels: client.guilds.cache.get(d.id).channels.cache,
                    users: client.guilds.cache.get(d.id).members.cache
                }}
            }
        }
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
client.login(botconfig.token)