import {app, BrowserWindow} from 'electron'
import path from 'path'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// const createWindow = () => {
//     const mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         webPreferences: {
//             contextIsolation: true,
//             nodeIntegration: false,
//         },
//     })
//
//     if (process.env.NODE_ENV === 'development') {
//         mainWindow.loadURL('http://localhost:3000').then(_ => {
//         })
//         mainWindow.webContents.openDevTools()
//     } else {
//         mainWindow.loadFile(path.join(__dirname, '../renderer/index.html')).then(_ => {
//         })
//     }
// }
//
// const createYiyan = () => {
//     const mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         x: 0,
//         y: 0,
//         webPreferences: {
//             preload: path.join(__dirname, '../preload/index.js'),
//             contextIsolation: true,
//             nodeIntegration: false,
//             webSecurity: true,
//         },
//     })
//
//     mainWindow.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')
//
//     mainWindow.loadURL('https://yiyan.baidu.com/').then(_ => {
//     })
//     // mainWindow.webContents.openDevTools()
// }

const createDeepseek = () => {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: true,
        },
    })

    mainWindow.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    mainWindow.loadURL('https://chat.deepseek.com/').then(_ => {
    })
    mainWindow.webContents.openDevTools()
}


app.whenReady().then(() => {
    // createWindow()
    // createYiyan()
    createDeepseek()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});