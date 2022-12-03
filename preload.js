const { ipcRenderer } = require('electron')

const toBackend = async obj => {
    return await ipcRenderer.invoke('backend', obj)
}

let html = {}
function runOnceRefreshHtmlElements() {
    let elms = document.getElementsByTagName('*')
    for (i in elms) {
        if (elms[i].id) html[elms[i].id] = elms[i]
        else if (elms[i].classList?.length) html[elms[i].classList[0]] = elms[i]
    }
    html.minimize.addEventListener('click', () => toBackend({ title: 'minimizeWin' }))
    html.maximize.addEventListener('click', async () => { let res = await toBackend({ title: 'maximizeWin' }) })
    html.close.addEventListener('click', () => toBackend({ title: 'closeWin' }))
}

function renderGuild(g) {
    let newGuild = document.createElement('div')
    newGuild.classList.add('guild')
    newGuild.innerHTML =
        `<img class="guildIcon" src="${g[2]}"></img>
    <div class="guildName" style="display: none;">${g[0]}</div>`
    html.serverslist.append(newGuild)
    runOnceRefreshHtmlElements()
    newGuild.children[0].addEventListener('click', e => toBackend({ title: 'navGuild', type: 'GUILD', id: g[1] }))
}

ipcRenderer.on('frontend', (event, d) => {
    console.log(d)
})
window.addEventListener('load', async () => {
    runOnceRefreshHtmlElements()
    if (window.location.href.split('/').pop() == 'app.html') {
        let initInfo = await toBackend({ title: 'initInfo' })
        for (let g in initInfo.guilds) {
            renderGuild(initInfo.guilds[g])
        }
    }
})
