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
    html.maximize.addEventListener('click', async () => { let res = await toBackend({ title: 'maximizeWin' })})
    html.close.addEventListener('click', () => toBackend({ title: 'closeWin' }))
}

window.addEventListener('load', async () => {
    runOnceRefreshHtmlElements()
})
