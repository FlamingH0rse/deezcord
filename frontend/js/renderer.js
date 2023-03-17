const { toBackend } = require('./electronipc.js')
let renderChannel = function (html, c) {
    if (c.type == 0) {
        let newChannel = document.createElement('div')
        newChannel.classList.add('channel')
        newChannel.innerHTML =
            `<img class="channelIcon" src="../assets/channel.svg">
            <p class="channelName" id="${c.id}">${c.name}</p>`
        html.channelslist.append(newChannel)
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
        `<img class="guildIcon" src="${g[2]}"></img>
        <div class="guildName" style="display: none;">${g[0]}</div>`
    html.serverslist.append(newGuild)
    newGuild.children[0].addEventListener('click', async e => {
        let guildInfo = await toBackend({ title: 'navGuild', type: 'GUILD', id: g[1] })
        html.channelslist.innerHTML = ''
        html.channeltop.textContent = g[0]
        console.log(guildInfo)
        guildInfo.d.channels.forEach(c => { renderChannel(html, c); })
    })
}
module.exports = {
    renderChannel,
    renderGuild
}
