const path = require('path')
const { ipcRenderer, shell } = require('electron')

let frontendPath = path.join(window.location.pathname.slice(1), '..', '..')
let { getAppDataPath, saveAppData, readAppData } = require(path.join(frontendPath, 'js', 'fs.js'))
let { renderChannelList, renderGuild, renderMessage } = require(path.join(frontendPath, 'js', 'renderer.js'))
let { toBackend, APP_NAME } = require(path.join(frontendPath, 'js', 'misc.js'))

let appState = readAppData('app-state')
let discordAuthData = readAppData('discord-auth')
let { lastGuild, lastClient } = appState

let html = {}
let titleBarInit = false
function runOnceRefreshHtmlElements() {
    let elms = document.getElementsByTagName('*')
    for (i in elms) {
        if (elms[i].id) html[elms[i].id] = elms[i]
        else if (elms[i].classList?.length) html[elms[i].classList[0]] = elms[i]
    }
    if (!titleBarInit) {
        html.minimize.addEventListener('click', () => toBackend({ title: 'minimizeWin' }))
        html.maximize.addEventListener('click', async () => {
            let res = await toBackend({ title: 'maximizeWin' })
            html.maximize.innerHTML = res.title === 'maximized' ? '❐' : '☐'
            if (window.location.href.split('/').pop() !== 'login.html') return
            html.loginbox.style.width = res.title === 'maximized' ? '720px' : '416px'
            html.loginbox.style.height = res.title === 'maximized' ? '344px' : '340px'
            let toggleQR = res.title === 'maximized' ? 'true' : 'false'
            html.loginbox.setAttribute('QR', toggleQR)

        })
        html.close.addEventListener('click', () => toBackend({ title: 'closeWin' }))
        titleBarInit = true
    }
}


ipcRenderer.on('frontend', (event, d) => {
    console.log(d)
    runOnceRefreshHtmlElements()
    if (d.title === 'navChannelSuccess') {
        html.inputbox.setAttribute('placeholder', `Message #${d.channelName}`)
        html.channeltopname.id = d.channelID
        html.channeltopname.innerHTML = d.channelName
        html.msgcontainer.innerHTML = ''

        // Render the messages
        d.messages.forEach(m => renderMessage(m))
        html.msgcontainer.lastChild.style['margin-bottom'] = '30px'

        html.msgcontainer.scrollTop = html.msgcontainer.scrollHeight

        Array.from(html.channellist.children).forEach(c => c.classList.remove('currentChannel'))
        Array.from(html.channellist.children).filter(c => c.id === d.channelID)[0].classList.add('currentChannel')
    }
    if (d.title === 'maximized' || d.title === 'unMaximized') {
        html.maximize.innerHTML = d.title === 'maximized' ? '❐' : '☐'
        if (window.location.href.split('/').pop() !== 'login.html') return
        html.loginbox.style.width = d.title === 'maximized' ? '720px' : '416px'
        html.loginbox.style.height = d.title === 'maximized' ? '344px' : '340px'
        html.loginbox?.setAttribute('QR', d.title === 'maximized' ? 'true' : 'false')
    }
    if (d.title === 'newMessage') {
        console.log(d.channelID, html.channeltopname.id)
        if (d.channelID === html.channeltopname.id) renderMessage(d)
    }
})
window.addEventListener('load', async () => {
    runOnceRefreshHtmlElements()
    if (window.location.href.split('/').pop() === 'app.html') {
        let initInfo = await toBackend({ title: 'initInfo' })
        html.profile.innerHTML =
            `<img class="botIcon" src="${initInfo.user.avatar}"></img>
            <div class="botName">${initInfo.user.username}</div>`
        let renderGuildList = new Promise((res, rej) => {
            for (let g in initInfo.guilds) {
                renderGuild(initInfo.guilds[g])
                runOnceRefreshHtmlElements()
            }
            res()
        })
        console.log(html.guildlist.children)
        renderGuildList.then(() => {
            console.log(lastGuild)
            if (lastGuild && html[lastGuild]) html[lastGuild].click()
            else html.guildlist.querySelectorAll('.guildIcon')[0].click()
        })
        html.inputbox.addEventListener("keyup", ({ key }) => {
            if (!html.inputbox.value.replace(/ /g, '')) return
            if (key === "Enter") {
                toBackend({ title: 'sendMessage', message: html.inputbox.value, channelID: html.channeltopname.id })
                html.inputbox.value = ''
            }
        })
        html.help.addEventListener('click', () => shell.openExternal('https://github.com/FlamingH0rse/deezcord'))
    }
    if (window.location.href.split('/').pop() === 'login.html') {
        if (lastClient && discordAuthData.clients[lastClient]?.token) {
            html.loadOverlay.style.display = 'block'
            let login = await toBackend({ title: 'loginDiscord', token: discordAuthData.clients[lastClient].token })
            if (login === 'loginSuccess') return window.href.location = window.location.href = '../app/app.html'
            html.loadOverlay.style.display = 'none'
        }
        html.forgottoken.addEventListener('click', () => shell.openExternal('https://discord.com/developers/applications'))
        html.createbot.addEventListener('click', () => shell.openExternal('https://discord.com/developers/applications'))

        html.loginbutton.addEventListener('click', async () => {
            if (!html.nicknamebox.value) return html.nicknameheader.style.color = 'red'
            if (!html.tokenbox.value) return html.tokenheader.style.color = 'red'

            discordAuthData.clients[html.nicknamebox.value] = { token: html.tokenbox.value }
            appState.lastClient = html.nicknamebox.value

            html.loadOverlay.style.display = 'block'
            let login = await toBackend({ title: 'loginDiscord', token: html.tokenbox.value })
            if (login === 'loginSuccess') {
                saveAppData('discord-auth', discordAuthData)
                saveAppData('app-state', appState)
                return window.href.location = window.location.href = '../app/app.html'
            } else {
                // Wrong token buddy :clown:
            }
        })
    }
})
