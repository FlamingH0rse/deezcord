const fs = require('fs')
const path = require('path')
// Don't put DOM elements outside functions
module.exports = {
    resolveAppData: function (frontPath, appDataDir) {
        return new Promise((res, rej) => {
            console.log(path.join(frontPath, '..', 'app-data.json'))
            let appDataTemplate = require(path.join(frontPath, '..', 'app-data.json'))
            for (let file in appDataTemplate) {
                let dirPath = path.join(appDataDir, 'Deezcord')
                let dirExists = fs.existsSync(dirPath)
                if (!dirExists) fs.mkdir(dirPath, err => {
                    if (err) rej()
                })
                let filePath = path.join(appDataDir, 'Deezcord', `${file}.json`)
                let fileExists = fs.existsSync(filePath)

                if (!fileExists || Object.keys(appDataTemplate[file]) != Object.keys(require(filePath))) {
                    fs.writeFile(filePath, JSON.stringify(appDataTemplate[file], null, '\t'), err => {
                        if (err) rej(err)
                        else return
                    })
                    console.log(`Created file ${filePath}`)
                    continue
                }
            }
            res()
        })
    },
    saveAppData: function (filename, data) {
        let appDataPath = path.join(require('electron').remote.app.getPath('appData'))
        data = JSON.stringify(data, null, '\t')
        fs.writeFile(path.join(appDataPath, 'Deezcord', `${filename}.json`), data, err => {
            if (err) console.log(err)
            else return
        })
    }
}