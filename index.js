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
        minWidth: 900,
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
                let channels = client.guilds.cache.get(d.id).channels.cache
                let noCatChannels = channels.filter(c => c.type == 0 && c.parentId == null).sort((a,b) => a.rawPosition - b.rawPosition)
                let categories = channels.filter(c => c.type == 4).sort((a,b) => a.rawPosition - b.rawPosition)
                let catChannels = channels.filter(c => c.type == 0 && c.parentId != null).sort((a,b) => a.rawPosition - b.rawPosition)
                let sortedCh = []
                sortedCh = sortedCh.concat(Array.from(noCatChannels))
                console.log(sortedCh)
                categories.forEach((cat, key) => {
                    sortedCh.push([key, cat])
                    let currentCh = catChannels.filter(c => c.parentId == cat.id)
                    sortedCh = sortedCh.concat(Array.from(currentCh))
                })
                console.log(sortedCh)
                return { title: 'navGuildSuccess', d: {
                    channels: sortedCh,
                    users: 0 //client.guilds.cache.get(d.id).members.cache.array()
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