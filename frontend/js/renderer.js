const path = require('path')

const { toBackend, formatDate, runOnceRefreshHtmlElements } = require('./misc.js')
const { getAppDataPath, saveAppData } = require('./fs.js')

const appState = require(path.join(getAppDataPath(), 'app-state.json'))

let html = {}

let renderUserList = function (u) {
    runOnceRefreshHtmlElements(html)
    let newUser = document.createElement('div')
    newUser.classList.add('user')
    newUser.innerHTML =
        `<img class="userAvatar" src="${u.avatar}">
        <p class="userName" id="${u.id}">${u.username}</p>`
    html.memberslist.append(newUser)
}

let renderMessage = function (m) {
    runOnceRefreshHtmlElements(html)
    let newMessage = document.createElement('div')
    newMessage.classList.add('message')
    newMessage.innerHTML =
        `<img class="authorAvatar" src="${m.author.avatar}">
        <div class="msgcompartment">
            <div class="uppercmp">
                <p class="authorName selectable" id="${m.author.id}">${m.author.username}</p>
                ${m.author.bot ? `<div class="botBadge">BOT</div>` : ``}
                <p class="timeStamp" id="${m.createdAt}">${formatDate(new Date(m.createdAt))}</p>
            </div>
            <p class="messagecontent selectable" id="${m.id}">${m.content}</p>
        </div>`

    if ((html.msgcontainer.lastChild?.querySelector('.authorName')?.id == m.author.id || html.msgcontainer.lastChild?.querySelector('.messagecontent').getAttribute('authorid') == m.author.id) && m.createdAt - html.msgcontainer.lastChild?.querySelector('.timeStamp').id < 7 * 60 * 1000) {
        newMessage.classList.replace('message', 'messagecont')
        newMessage.innerHTML =
            `<p class="timeStamp" id="${m.createdAt}" hidden>${formatDate(new Date(m.createdAt))}</p>
            <p class="messagecontent selectable" id="${m.id}" authorid="${m.author.id}">${m.content}</p>`
    }

    if (newMessage.querySelector('.messagecontent').textContent.replace(/ /g, '') == '' && Array.from(newMessage.querySelectorAll('.emoji')).length <= 30) {
        Array.from(newMessage.querySelectorAll('.emoji')).forEach(e => { e.style.width = '48px'; e.style.height = '48px' })
    }
    if (html.msgcontainer.lastChild) html.msgcontainer.lastChild.style['margin-bottom'] = '0px'
    html.msgcontainer.append(newMessage)
    html.msgcontainer.lastChild.style['margin-bottom'] = '30px'
    html.msgcontainer.scrollTop = html.msgcontainer.scrollHeight
}

let renderChannelList = function (c, guildID) {
    runOnceRefreshHtmlElements(html)
    if (c.type == 0) {
        let newChannel = document.createElement('div')
        newChannel.classList.add('channel')
        newChannel.id = c.id
        newChannel.innerHTML =
            `<img class="channelIcon" src="../assets/channel.svg">
            <div class="channelName">${c.name}</div>`
        html.channellist.append(newChannel)
        newChannel.addEventListener('click', async e => {
            appState.cachedGuilds[guildID] = c.id
            saveAppData('app-state', appState)
            toBackend({ title: 'navChannel', guildID: guildID, id: c.id })
        })
    } if (c.type == 4) {
        let newCategory = document.createElement('div')
        newCategory.classList.add('category')
        newCategory.innerHTML =
            `<p class="categoryName" id="${c.id}">${c.name.toUpperCase()}</p>`
        html.channellist.append(newCategory)
    }
}

let renderGuild = function (g) {
    runOnceRefreshHtmlElements(html)
    let newGuild = document.createElement('div')
    newGuild.classList.add('guild')
    if (!g.icon || g.icon == null) newGuild.innerHTML = `<div class="guildIcon" id="${g.id}" src="${g.icon}">${g.name.split(' ').map(w => w.split('').shift()).join('')}</div>`
    else newGuild.innerHTML = `<img class="guildIcon" id="${g.id}" src="${g.icon}">`

    html.guildlist.append(newGuild)
    newGuild.children[0].addEventListener('click', async e => {
        appState.lastGuild = g.id
        saveAppData('app-state', appState)
        let guildInfo = await toBackend({ title: 'navGuild', type: 'GUILD', id: g.id })
        html.channellist.innerHTML = ''
        html.msgcontainer.innerHTML = ''
        html.memberslist.innerHTML = ''
        html.channeltopname.innerHTML = ''
        html.channellisttop.innerHTML = g.name
        guildInfo.users.forEach(u => renderUserList(u))
        guildInfo.channels.forEach(c => renderChannelList(c, g.id))
        html.channellist.children[0].style['margin-top'] = '12px'
        let lastChannel = appState.cachedGuilds[g.id] || guildInfo.channels.filter(c => c.type == 0)[0].id
        toBackend({ title: 'navChannel', guildID: g.id, id: lastChannel })
    })
}

module.exports = {
    renderChannelList,
    renderGuild,
    renderMessage
}
