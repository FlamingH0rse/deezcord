const { ipcRenderer } = require('electron')
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
    }
}