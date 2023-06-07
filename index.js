const path = require('path')

const {app, BrowserWindow, ipcMain, dialog} = require('electron')

// Discord:
const {Client, GatewayIntentBits} = require('discord.js');

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMessageReactions, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers]});

// Sleep function
function sleep(ms) {
    return new Promise(res => setTimeout(res, ms))
}

let mainWindow
let loadingWindow

const createLoadingWindow = () => {
    console.log('Creating login window...')

    loadingWindow = new BrowserWindow({
        backgroundColor: '#202225',
        resizable: false,
        width: 300,
        height: 350,
        titleBarStyle: 'hidden',
        movable: true,
        minimizable: false,
        fullscreenable: false,
        icon: "./frontend/assets/app_icon.png",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
        }
    })
    loadingWindow.loadFile('./frontend/loadingscreen/loading.html')
}

const createWindow = () => {
    console.log('Creating window...')

    mainWindow = new BrowserWindow({
        backgroundColor: '#202225',
        width: 900,
        height: 600,
        minWidth: 940,
        minHeight: 500,
        titleBarStyle: 'hidden',
        fullscreenable: false,
        icon: "./frontend/assets/app_icon.png",
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, "preload.js") // use a preload script
        }
    })
    mainWindow.loadFile('./frontend/login/login.html')
}

let discordConnected = false
const connectDiscord = (token) => {
    return new Promise((res, rej) => {
        client.login(token).then(() => {
            discordConnected = true
            res('loginSuccess')
        }).catch(() => rej('loginFailure'))
    })
}

client.once('ready', () => {
    console.log('Connected to Discord');
    client.user.setActivity("DiscordForBots", {
        type: ActivityType,
        url: "https://www.github.com/FlamingH0rse/"
    });
    discordConnected = true
});

client.on('messageCreate', message => {
    console.log('message received')
    message.content = require('./frontend/js/misc.js').clientParse(client, message.content, message.guildId)
    mainWindow.webContents.send('frontend', {
        title: 'newMessage',
        channelID: message.channel.id,
        id: message.id,
        createdAt: message.createdTimestamp,
        content: message.content,
        author: {
            id: message.author.id,
            bot: message.author.bot,
            username: message.author.username,
            avatar: message.author.displayAvatarURL()
        }
    })
})

app.whenReady().then(async () => {
    // Simulate auto update for now
    // Checking for updates
    createLoadingWindow()

    await sleep(10000)

    // Starting
    const appDataDir = path.join(app.getPath('appData'), 'deezcord')
    await require('./frontend/js/fs.js').resolveAppData(path.resolve('./frontend'), appDataDir)

    createWindow()
    loadingWindow.close()

    ipcMain.handle('backend', async (event, d) => {
        console.log(d)
        if (d.title === 'loginDiscord') {
            if (discordConnected) return
            else return connectDiscord(d.token)
        }

        // Window Resizing

        if (d.title === 'minimizeWin') mainWindow.minimize()
        else if (d.title === 'maximizeWin') {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize()
                return {title: 'unMaximized'}
            } else {
                mainWindow.maximize();
                return {title: 'maximized'}
            }
        } else if (d.title === 'closeWin') mainWindow.close()

        if (!discordConnected) return

        // Discord Client Data Stuff

        if (d.title === 'initInfo') {
            return {
                user: {
                    username: client.user.tag,
                    avatar: client.user.displayAvatarURL()
                },
                guilds: client.guilds.cache.map(g => {
                    return {
                        name: g.name,
                        id: g.id,
                        icon: g.iconURL()
                    }
                })
            }
        }
        if (d.title === 'navGuild') {
            if (d.type === 'GUILD' && client.guilds.cache.get(d.id)) {
                let channels = client.guilds.cache.get(d.id).channels.cache

                let categories = channels.filter(c => c.type === 4).sort((a, b) => a.rawPosition - b.rawPosition)
                let noCatChannels = channels.filter(c => c.type === 0 && c.parentId == null).sort((a, b) => a.rawPosition - b.rawPosition)
                let catChannels = channels.filter(c => c.type === 0 && c.parentId != null).sort((a, b) => a.rawPosition - b.rawPosition)

                let sortedCh = Array.from(noCatChannels)
                categories.forEach((cat, key) => {
                    sortedCh.push([key, cat])
                    let currentCh = catChannels.filter(c => c.parentId === cat.id)
                    sortedCh = sortedCh.concat(Array.from(currentCh))
                })

                return {
                    title: 'navGuildSuccess',
                    channels: sortedCh.map(c => {
                        return {
                            type: c[1].type,
                            id: c[1].id,
                            name: c[1].name
                        }
                    }),
                    users: client.guilds.cache.get(d.id).members.cache.map(u => {
                        return {
                            id: u.user.id,
                            bot: u.user.bot,
                            username: u.user.username,
                            tag: u.user.discriminator,
                            avatar: u.displayAvatarURL()
                        }
                    })

                }
            }
        }
        if (d.title === 'navChannel') {
            let channel = client.guilds.cache.get(d.guildID).channels.cache.get(d.id)
            let res = {}

            channel.messages.fetch({limit: 100}).then(messages => {
                messages.reverse()
                res.messages = messages.map(m => {
                    return {
                        id: m.id,
                        createdAt: m.createdTimestamp,
                        content: require('./frontend/js/misc.js').clientParse(client, m.content, m.guildId),
                        author: {
                            id: m.author.id,
                            bot: m.author.bot,
                            username: m.author.username,
                            avatar: m.author.displayAvatarURL()
                        }
                    }
                })
                res.title = 'navChannelSuccess'
                res.channelName = channel.name
                res.channelID = channel.id
                mainWindow.webContents.send('frontend', res)
            })
        }
        if (d.title === 'sendMessage') {
            client.channels.cache.get(d.channelID).send(d.message)
        }
    })

    mainWindow.on('resize', () => {
        if (mainWindow.isMaximized()) mainWindow.webContents.send('frontend', {title: 'maximized'})
        else mainWindow.webContents.send('frontend', {title: 'unMaximized'})
    })

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

process.on('uncaughtException', err => console.log(err))

process.on('unhandledRejection', err => console.log(err))