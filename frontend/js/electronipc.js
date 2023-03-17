const { ipcRenderer } = require('electron')
module.exports = {
    toBackend: async function (obj) {
        return await ipcRenderer.invoke('backend', obj)
    }
}