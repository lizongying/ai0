import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'path'
import {fileURLToPath} from 'url'
import {join} from 'node:path'
import {readFileSync} from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const windows = new Map<string, BrowserWindow>()

const createMe = (): BrowserWindow => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/me.js'),
            nodeIntegration: false,
            contextIsolation: true,
        },
    })

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000').then()
    } else {
        win.loadFile(path.join(__dirname, '../renderer/index.html')).then()
    }
    win.webContents.openDevTools()
    windows.set('me', win)
    return win
}

const createYiyan = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        x: 0,
        y: 0,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: false,
            webSecurity: true,
        },
    })

    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    win.loadURL('https://yiyan.baidu.com/').then()
    // mainWindow.webContents.openDevTools()
    windows.set('yiyan', win)
    return win
}

const createDeepseek = (): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
    })

    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    win.loadURL('https://chat.deepseek.com/').then(_ => {
        win.webContents
            .executeJavaScript(readFileSync(join(__dirname, 'renderer_deepseek.js'), 'utf-8'))
            .then()
    })
    win.webContents.openDevTools()

    // win.webContents.on('did-finish-load', () => {
    //     win.webContents
    //         .executeJavaScript(readFileSync(join(__dirname, 'renderer_deepseek.js'), 'utf-8'))
    //         .then()
    // })

    windows.set('deepseek', win)
    return win
}


const createDoubao = (): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            // preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
    })

    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    win.loadURL('https://www.doubao.com/chat/').then(_ => {
    })
    win.webContents.openDevTools()
    windows.set('doubao', win)
    return win
}

const createKimi = (): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1200,
        height: 600,
        webPreferences: {
            // preload: path.join(__dirname, '../preload/index.js'),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
    })

    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    win.loadURL('https://kimi.moonshot.cn/chat/').then(_ => {
    })
    win.webContents.openDevTools()
    windows.set('kimi', win)
    return win
}

app.whenReady().then(() => {
    createMe()
    console.log(createMe)
    // createYiyan()
    console.log(createYiyan)
    // createDoubao()
    console.log(createDoubao)
    // createKimi()
    console.log(createKimi)
    createDeepseek()
    console.log(createDeepseek)

    ipcMain.on('chat', (_, message) => {
        windows.get(message.to)?.webContents.send('chat', message)
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})