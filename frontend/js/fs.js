const fs = require('fs')
const path = require('path')
let frontendPath = path.join(window.location.pathname.slice(1), '..', '..')
module.exports = {
    resolveAppData: function () {
        return new Promise((res, rej) => {
            let appDataTemplate = require(path.join(frontendPath, '..', 'app-data.json'))
            for (let file in appDataTemplate) {
                let dirPath = path.join(frontendPath, 'app-data')
                let dirExists = fs.existsSync(dirPath)
                if (!dirExists) fs.mkdir(dirPath)
                let filePath = path.join(frontendPath, 'app-data', `${file}.json`)
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
        data = JSON.stringify(data, null, '\t')
        fs.writeFile(path.join(frontendPath, 'app-data', `${filename}.json`), data, err => {
            if (err) console.log(err)
            else return
        })
    }
}