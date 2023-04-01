const fs = require('fs')
const path = require('path')
const { APP_NAME } = require('./misc.js')
// Don't put DOM elements outside functions
module.exports = {
    getAppDataPath: function () {
        switch (process.platform) {
            case 'darwin': {
                return path.join(process.env.HOME, 'Library', 'Application Support', APP_NAME);
            }
            case 'win32': {
                return path.join(process.env.APPDATA, APP_NAME);
            }
            case 'linux': {
                return path.join(process.env.HOME, APP_NAME);
            }
            default: {
                console.error(`Unsupported OS: ${process.platform}`)
                return './'
            }
        }
    },
    resolveAppData: function (frontPath, appDataDir) {
        return new Promise((res, rej) => {
            console.log(path.join(frontPath, '..', 'app-data.json'))
            let appDataTemplate = require(path.join(frontPath, '..', 'app-data.json'))
            for (let file in appDataTemplate) {
                let dirPath = appDataDir
                let dirExists = fs.existsSync(dirPath)
                if (!dirExists) fs.mkdir(dirPath, err => {
                    if (err) rej()
                })
                let filePath = path.join(appDataDir, `${file}.json`)
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
        let appDataPath = this.getAppDataPath()
        data = JSON.stringify(data, null, '\t')
        fs.writeFile(path.join(appDataPath, `${filename}.json`), data, err => {
            if (err) console.log(err)
            else return
        })
    }
}