const { ipcRenderer } = require('electron')
const path = require('path')
let frontendPath = path.join(window.location.pathname.slice(1), '..', '..')
let { renderChannelList, renderGuild, renderMessage } = require(path.join(frontendPath, 'js', 'renderer.js'))
let { toBackend } = require(path.join(frontendPath, 'js', 'misc.js'))
let { lastGuild } = require(path.join(frontendPath, 'app-data', 'app-state.json'))

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
        })
        html.close.addEventListener('click', () => toBackend({ title: 'closeWin' }))
        titleBarInit = true
    }
}

ipcRenderer.on('frontend', (event, d) => {
    console.log(d)
    runOnceRefreshHtmlElements()
    if (d.title == 'navChannelSuccess') {
        html.middletop.textContent = d.channelName
        d.messages.forEach(m => renderMessage(html, m))
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
        renderGuildList.then(() => {
            console.log(lastGuild)
            if (lastGuild && html[lastGuild]) html[lastGuild].click()
            else html.serverlist.children.filter(g => g.classList.contains('guildIcon'))[0].click()
        })
    }
})
