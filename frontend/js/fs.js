const fs = require('fs')
const path = require('path')
const { validateJson, APP_NAME } = require('./misc.js')
// Don't put DOM elements outside functions

function getAppDataPath() {
    switch (process.platform) {
        case 'darwin': {
            return path.join(process.env.HOME, 'Library', 'Application Support', APP_NAME)
        }
        case 'win32': {
            return path.join(process.env.APPDATA, APP_NAME)
        }
        case 'linux': {
            return path.join(process.env.HOME, APP_NAME)
        }
        default: {
            console.error(`Unsupported OS: ${process.platform}`)
            return './'
        }
    }
}
function resolveAppData(frontPath, appDataDir) {
    return new Promise(async (resolve, reject) => {
        console.log('Template: ', path.join(frontPath, '..', 'app-data.json'))
        let appDataTemplate = require(path.join(frontPath, '..', 'app-data.json'))

        let dirExists = fs.existsSync(appDataDir)

        let resolveAppDataDir = new Promise((res, rej) => {
            if (!dirExists) fs.mkdir(appDataDir, err => {
                if (err) reject()
                else {
                    console.log(`Created appdata directory: ${appDataDir}`)
                    res()
                }
            })
            else {
                console.log(`${appDataDir} already exists`)
                res()
            }
        })
        await resolveAppDataDir

        /* Check for files */
        for (let file in appDataTemplate) {
            try { await resolveFile }
            catch (err) { reject(err) }
            
        }
        resolve()
    })
}
function resolveFile() {
    return new Promise((res, rej) => {
        let filePath = path.join(appDataDir, `${file}.json`)
        let fileExists = fs.existsSync(filePath)

        if (fileExists && typeof validateJson(readAppData(file, false)) == 'object' && Object.keys(appDataTemplate[file]).toString() == Object.keys(require(filePath)).toString()) {
            console.log(`${filePath} already exists, skipping...`)
            res()
        } else {
            console.log('Trying to give WRITE permission to file')
            fs.chmod(filePath, 0o600, () => {
                console.log('Trying to write to file')
                fs.writeFile(filePath, JSON.stringify(appDataTemplate[file], null, '\t'), err => {
                    if (err) rej(err)
                    else {
                        console.log(`Created appdata file: ${filePath}`)
                        res()
                    }
                })
            })
        }
    })
}
function readAppData(filename, parseAsJson) {
    if (parseAsJson == undefined) parseAsJson = true

    let filePath = path.join(getAppDataPath(), `${filename}.json`)
    fs.chmodSync(filePath, 0o400)
    try {
        let data = fs.readFileSync(filePath, 'utf8')
        if (parseAsJson == true) return JSON.parse(data)
        else return data
    } catch (e) {
        console.log(e)
    }
}
function saveAppData(filename, data) {
    data = JSON.stringify(data, null, '\t')
    let filePath = path.join(getAppDataPath(), `${filename}.json`)
    fs.chmodSync(filePath, 0o600)
    try {
        fs.writeFileSync(filePath, data)
    } catch (e) {
        console.log(e)
    }
}
module.exports = {
    getAppDataPath,
    resolveAppData,
    readAppData,
    saveAppData
}