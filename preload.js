const { ipcRenderer } = require('electron')
const path = require('path')
let { renderChannel, renderGuild } = require(path.join(window.location.pathname.slice(1), '..', '..', 'js', 'renderer.js'))
let { toBackend } = require(path.join(window.location.pathname.slice(1), '..', '..', 'js', 'electronipc.js'))

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
})
window.addEventListener('load', async () => {
    runOnceRefreshHtmlElements()
    if (window.location.href.split('/').pop() == 'app.html') {
        let initInfo = await toBackend({ title: 'initInfo' })
        html.profile.innerHTML =
            `<img class="botIcon" src="${initInfo.user[1]}"></img>
            <div class="botName">${initInfo.user[0]}</div>`
        for (let g in initInfo.guilds) {
            renderGuild(html, initInfo.guilds[g])
            runOnceRefreshHtmlElements()
        }
    }
})
