const { toBackend, formatDate, APP_NAME } = require('./misc.js')
const { getAppDataPath, saveAppData } = require('./fs.js')
const path = require('path')
const appState = require(path.join(getAppDataPath(), 'app-state.json'))

let renderUserList = function (html, u) {
    let newUser = document.createElement('div')
    newUser.classList.add('user')
    newUser.innerHTML =
        `<img class="userAvatar" src="${u.avatar}">
        <p class="userName" id="${u.id}">${u.username}</p>`
    html.memberslist.append(newUser)
}

let renderMessage = function (html, m) {
    let newMessage = document.createElement('div')
    newMessage.classList.add('message')
    newMessage.innerHTML =
        `<img class="authorAvatar" src="${m.author.avatar}">
        <div class="msgcompartment">
            <div class="uppercmp">
                <p class="authorName" id="${m.author.id}">${m.author.username}</p>
                ${m.author.bot ? `<p class="botBadge">BOT</p>` : ``}
                <p class="timeStamp">${formatDate(new Date(m.createdAt))}</p>
            </div>
            <p class="messagecontent" id="${m.id}">${m.content}</p>
        </div>`
    /*    
    if (html.msgcontainer.lastChild.querySelector('.authorName').id == m.author.id) {
        newMessage.classList.replace('message', 'messagecont')
        newMessage.innerHTML = 
            `<p class="timeStamp" hidden>${formatDate(new Date(m.createdAt))}</p>
            <p class="messagecontent" id="${m.id}" data-authorid="${m.author.id}">${m.content}</p>`
    }
    */
    html.msgcontainer.prepend(newMessage)
}

let renderChannelList = function (html, c, guildID) {
    if (c.type == 0) {
        let newChannel = document.createElement('div')
        newChannel.classList.add('channel')
        newChannel.innerHTML =
            `<img class="channelIcon" src="../assets/channel.svg">
            <p class="channelName" id="${c.id}">${c.name}</p>`
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

let renderGuild = function (html, g) {
    let newGuild = document.createElement('div')
    newGuild.classList.add('guild')
    if (g.icon != null) newGuild.innerHTML = `<img class="guildIcon" id="${g.id}" src="${g.icon}">`
    else newGuild.innerHTML = `<div class="guildIcon" id="${g.id}" src="${g.icon}">${g.name.split(' ').map(w => w.split('').shift()).join('')}</div>`
    
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
        guildInfo.users.forEach(u => renderUserList(html, u))
        guildInfo.channels.forEach(c => renderChannelList(html, c, g.id))
        let lastChannel = appState.cachedGuilds[g.id] || guildInfo.channels.filter(c => c.type == 0)[0].id
        toBackend({ title: 'navChannel', guildID: g.id, id: lastChannel })
    })
}

module.exports = {
    renderChannelList,
    renderGuild,
    renderMessage
}
