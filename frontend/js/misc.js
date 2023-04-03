const { ipcRenderer } = require('electron');
const twemoji = require('twemoji');

function hexToRgb(hex, isRole) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    let res = [1, 2, 3].map(i => parseInt(result[i], 16)).join(',')
    if (isRole) res = '88,101,242'
    return res

}
module.exports = {
    APP_NAME: 'deezcord',
    toBackend: async function (obj) {
        return await ipcRenderer.invoke('backend', obj)
    },
    formatDate: function (d) {
        let date
        if (d.getDay() == new Date(Date.now()).getDay()) date = 'Today at'
        else if (d.getDay() == new Date(Date.now()).getDay() - 1) date = 'Yesterday at'
        else date = d.toLocaleString('en-US', { year: 'numeric', month: 'numeric', day: 'numeric' })
        let time = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
        return date + ' ' + time
    },
    validateJson: function (jsonstr) {
        try {
            let parsedJson = JSON.parse(jsonstr)
            return parsedJson
        } catch (e) {
            return false
        }
    },
    runOnceRefreshHtmlElements: function (html) {
        let elms = document.getElementsByTagName('*')
        for (i in elms) {
            if (elms[i].id) html[elms[i].id] = elms[i]
            else if (elms[i].classList?.length) html[elms[i].classList[0]] = elms[i]
        }
        return html
    },
    clientParse: function (client, str, guildID) {
        let currentGuild = client.guilds.cache.get(guildID)
        str = str.replace(/</g, '&lt').replace(/>/g, '&gt').replace(/\n/g, '<br />')
        str = twemoji.parse(str)
        let userMatches = [...str.matchAll(/&lt@(\d+)&gt/g)]
        userMatches.forEach(o => {
            str = str.replace(o[0], `<div class="usermention">@${currentGuild.members.cache.get(o[1])?.nickname || client.users.cache.get(o[1])?.username || o[1]}</div>`)
        })

        let roleMatches = [...str.matchAll(/&lt@&(\d+)&gt/g)]
        roleMatches.forEach(o => {
            let matchRole = currentGuild.roles.cache.get(o[1])
            if (!matchRole) str = '@deleted-role';
            else str = str.replace(o[0], 
                `<div class="rolemention" 
                style=
                "background-color: rgba(${hexToRgb(matchRole.hexColor, true)}, 0.1);
                color: ${matchRole.hexColor};">
                @${matchRole.name}
                </div>`)
        })
        let channelMatches = [...str.matchAll(/&lt#(\d+)&gt/g)]
        channelMatches.forEach(o => {
            str = str.replace(o[0], `<div class="channelmention">@${currentGuild.channels.cache.get(o[1])?.name || 'Unknown'}</div>`)
        })
        return str
    }
}