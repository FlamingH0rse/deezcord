const { ipcRenderer, shell } = require('electron')
const path = require('path')
let frontendPath = path.join(window.location.pathname.slice(1), '..', '..')
let { getAppDataPath } = require(path.join(frontendPath, 'js', 'fs.js'))
let { renderChannelList, renderGuild, renderMessage } = require(path.join(frontendPath, 'js', 'renderer.js'))
let { toBackend, APP_NAME } = require(path.join(frontendPath, 'js', 'misc.js'))
let { lastGuild } = require(path.join(getAppDataPath(), 'app-state.json'))

let html = {}
let titleBarInit = false
function runOnceRefreshHtmlElements() {
    let elms = document.getElementsByTagName('*')
    for (i in elms) {
        if (elms[i].id) html[elms[i].id] = elms[i]
        else if (elms[i].classList?.length) html[elms[i].classList[0]] = elms[i]
    }
    if (titleBarInit == false) {
        html.minimize.addEventListener('click', () => toBackend({ title: 'minimizeWin' }))
        html.maximize.addEventListener('click', async () => {
            let res = await toBackend({ title: 'maximizeWin' })
            html.maximize.innerHTML = res.title == 'maximized' ? '❐' : '☐'
            html.loginbox.style.width = res.title == 'maximized' ? '720px' : '416px'
            html.loginbox.style.height = res.title == 'maximized' ? '344px' : '340px'
            let toggleQR = res.title == 'maximized' ? 'true' : 'false'
            html.loginbox?.setAttribute('QR', toggleQR)

        })
        html.close.addEventListener('click', () => toBackend({ title: 'closeWin' }))
        titleBarInit = true
    }
}

ipcRenderer.on('frontend', (event, d) => {
    console.log(d)
    runOnceRefreshHtmlElements()
    if (d.title == 'navChannelSuccess') {
        html.inputbox.setAttribute('placeholder', `Message #${d.channelName}`)
        html.channeltop.id = d.channelID
        html.channeltop.innerHTML = d.channelName
        html.msgcontainer.innerHTML = ''
        d.messages.forEach(m => renderMessage(html, m))
    }
    if (d.title == 'maximized' || d.title == 'unMaximized') {
        html.maximize.innerHTML = d.title == 'maximized' ? '❐' : '☐'
        html.loginbox.style.width = d.title == 'maximized' ? '720px' : '416px'
        html.loginbox.style.height = d.title == 'maximized' ? '344px' : '340px'
        html.loginbox?.setAttribute('QR', d.title == 'maximized' ? 'true' : 'false')
    }
})
window.addEventListener('load', async () => {
    runOnceRefreshHtmlElements()
    if (window.location.href.split('/').pop() == 'app.html') {
        let initInfo = await toBackend({ title: 'initInfo' })
        html.profile.innerHTML =
            `<img class="botIcon" src="${initInfo.user.avatar}"></img>
            <div class="botName">${initInfo.user.username}</div>`
        let renderGuildList = new Promise((res, rej) => {
            for (let g in initInfo.guilds) {
                renderGuild(html, initInfo.guilds[g])
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
    }
    if (window.location.href.split('/').pop() == 'login.html') {
        html.forgottoken.addEventListener('click', () => shell.openExternal('https://discord.com/developers/applications'))
        html.createbot.addEventListener('click', () => shell.openExternal('https://discord.com/developers/applications'))
    }
})
