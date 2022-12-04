const { ipcRenderer } = require('electron')

const toBackend = async obj => {
    return await ipcRenderer.invoke('backend', obj)
}

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
        html.maximize.addEventListener('click', async () => { let res = await toBackend({ title: 'maximizeWin' }) })
        html.close.addEventListener('click', () => toBackend({ title: 'closeWin' }))
        titleBarInit = true
    }
}

function renderChannel(c) {
    if (c[0] == 0) {
        let newChannel = document.createElement('div')
        newChannel.classList.add('channel')
        newChannel.innerHTML =
            `<img class="channelIcon" src="../assets/channel.svg">
            <p class="channelName" id="${c[2]}">${c[1]}</p>`
        html.channelslist.append(newChannel)
    } if (c[0] == 4) {
        let newCategory = document.createElement('div')
        newCategory.classList.add('category')
        newCategory.innerHTML = 
        `<p class="categoryName" id="${c[2]}">${c[1].toUpperCase()}</p>`
        html.channelslist.append(newCategory)
    }
    runOnceRefreshHtmlElements()
}

function renderGuild(g) {
    let newGuild = document.createElement('div')
    newGuild.classList.add('guild')
    newGuild.innerHTML =
        `<img class="guildIcon" src="${g[2]}"></img>
        <div class="guildName" style="display: none;">${g[0]}</div>`
    html.serverslist.append(newGuild)
    runOnceRefreshHtmlElements()
    newGuild.children[0].addEventListener('click', async e => {
        let guildInfo = await toBackend({ title: 'navGuild', type: 'GUILD', id: g[1] })
        console.log(guildInfo)
        guildInfo.d.channels.forEach(c => {renderChannel([c[1].type, c[1].name, c[1].id]) })
    })
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
            renderGuild(initInfo.guilds[g])
        }
    }
})
