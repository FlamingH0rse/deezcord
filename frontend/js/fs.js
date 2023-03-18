const fs = require('fs')
const path = require('path')
let frontendPath = path.join(window.location.pathname.slice(1), '..', '..')
module.exports = {
    saveAppData: function (filename, data) {
        data = JSON.stringify(data, null, '\t')
        fs.writeFileSync(path.join(frontendPath, 'app-data', `${filename}.json`), data)
    }
}