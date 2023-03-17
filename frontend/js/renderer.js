const { toBackend } = require('./electronipc.js')
let renderUserList = function (html, u) {
    let newUser = document.createElement('div')
    newUser.classList.add('user')
    newUser.innerHTML =
        `<img class="userAvatar" src="${u.avatar}">
        <p class="userName" id="${u.id}">${u.username + '#' + u.tag}</p>`
    html.memberslist.append(newUser)
}
let renderMessage = function (html, m) {
    let newMessage = document.createElement('div')
    newMessage.classList.add('message')
    newMessage.innerHTML =
        `<img class="authorAvatar" src="${m.author.avatar}">` +
            (m.author.bot ? `<p class="botBadge">BOT</p>` : ``) +
        `<p class="authorName" id="${m.author.id}">${m.author.username}</p>
        <p class="timeStamp">${new Date(m.createdAt)}</p>
        <p class="messagecontent" id="${m.id}">${m.content}</p>`;
    html.msgcontainer.append(newMessage)
}
let renderChannelList = function (html, c, guildID) {
    if (c.type == 0) {
        let newChannel = document.createElement('div')
        newChannel.classList.add('channel')
        newChannel.innerHTML =
            `<img class="channelIcon" src="../assets/channel.svg">
            <p class="channelName" id="${c.id}">${c.name}</p>`
        html.channelslist.append(newChannel)
        newChannel.addEventListener('click', async e => {
            toBackend({ title: 'navChannel', guildID: guildID, id: c.id })
            html.msgcontainer.textContent = ''
        })
    } if (c.type == 4) {
        let newCategory = document.createElement('div')
        newCategory.classList.add('category')
        newCategory.innerHTML =
            `<p class="categoryName" id="${c.id}">${c.name.toUpperCase()}</p>`
        html.channelslist.append(newCategory)
    }
}
let renderGuild = function (html, g) {
    let newGuild = document.createElement('div')
    newGuild.classList.add('guild')
    newGuild.innerHTML =
        `<img class="guildIcon" src="${g.avatar}"></img>
        <div class="guildName" style="display: none;">${g.name}</div>`
    html.serverslist.append(newGuild)
    newGuild.children[0].addEventListener('click', async e => {
        let guildInfo = await toBackend({ title: 'navGuild', type: 'GUILD', id: g.id })
        html.channelslist.innerHTML = ''
        html.memberslist.innerHTML = ''
        html.channeltop.textContent = g.name
        guildInfo.users.forEach(u => renderUserList(html, u))
        guildInfo.channels.forEach(c => renderChannelList(html, c, g.id))
    })
}
module.exports = {
    renderChannelList,
    renderGuild,
    renderMessage
}
