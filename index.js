const botconfig = require('./config.json');
const savedcache = require('./cache.json')
const { app, BrowserWindow, ipcMain, dialog } = require('electron')

//discord:
const Discord = require('discord.js');
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers] });

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
        icon: "./icon.png",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js") // use a preload script
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
            res.user = {
                username: client.user.tag, avatar: client.user.displayAvatarURL()
            }
            res.guilds = client.guilds.cache.map(g => {
                return {
                    name: g.name,
                    id: g.id,
                    avatar: g.iconURL()
                }
            })
            if (savedcache.lastGuild.type == 'GUILD' && client.guilds.cache.get(savedcache.lastGuild.id)) {
                res.currentGuild = client.guilds.cache.get(savedcache.lastGuild.id)
            }
            return res
        }
        if (d.title == 'navGuild') {
            if (d.type == 'GUILD' && client.guilds.cache.get(d.id)) {
                let channels = client.guilds.cache.get(d.id).channels.cache
                let noCatChannels = channels.filter(c => c.type == 0 && c.parentId == null).sort((a, b) => a.rawPosition - b.rawPosition)
                let categories = channels.filter(c => c.type == 4).sort((a, b) => a.rawPosition - b.rawPosition)
                let catChannels = channels.filter(c => c.type == 0 && c.parentId != null).sort((a, b) => a.rawPosition - b.rawPosition)
                let sortedCh = []
                sortedCh = sortedCh.concat(Array.from(noCatChannels))
                categories.forEach((cat, key) => {
                    sortedCh.push([key, cat])
                    let currentCh = catChannels.filter(c => c.parentId == cat.id)
                    sortedCh = sortedCh.concat(Array.from(currentCh))
                })
                sortedCh = sortedCh.map(c => {
                    return {
                        type: c[1].type,
                        id: c[1].id,
                        name: c[1].name
                    }
                })
                let users = client.guilds.cache.get(d.id).members.cache.map(u => {
                    return {
                        id: u.user.id,
                        bot: u.user.bot,
                        username: u.user.username,
                        tag: u.user.discriminator,
                        avatar: u.displayAvatarURL()
                    }
                })
                return {
                    title: 'navGuildSuccess',
                    channels: sortedCh,
                    users: users

                }
            }
        }
        if (d.title == 'navChannel') {
            let channel = client.guilds.cache.get(d.guildID).channels.cache.get(d.id)
            let res = {}

            channel.messages.fetch({ limit: 100 }).then(messages => {
                res.messages = messages.map(m => {
                    return {
                        id: m.id,
                        created: m.createdTimestamp,
                        content: m.content,
                        author: {
                            id: m.author.id,
                            bot: m.author.bot,
                            username: m.author.username,
                            avatar: m.author.displayAvatarURL()
                        }
                    }
                })
            })
            res.title = 'navChannelSuccess'
            return res
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