import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'path'
import {fileURLToPath} from 'url'
import {join} from 'node:path'
import {readFileSync} from 'node:fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const windows = new Map<string, {
    open: (headless: boolean) => void
    close: () => void
    window: BrowserWindow | null
}>()

const createMe = (headless: boolean): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        show: !headless,
        skipTaskbar: headless,
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
    // win.webContents.openDevTools()
    return win
}

const createYiyan = (headless: boolean) => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        show: !headless,
        skipTaskbar: headless,
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
    return win
}

const createDeepseek = (headless: boolean): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        show: !headless,
        skipTaskbar: headless,
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
    // win.webContents.openDevTools()
    return win
}


const createDoubao = (headless: boolean): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        show: !headless,
        skipTaskbar: headless,
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
    return win
}

const createKimi = (headless: boolean): BrowserWindow => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        show: !headless,
        skipTaskbar: headless,
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
    return win
}

let canClose = false

const registerWindow = (name: string, createFn: (headless: boolean) => BrowserWindow, closeFn?: (win: BrowserWindow) => void) => {
    const openManager = (headless: boolean) => {
        const existing = windows.get(name)
        if (existing?.window && !existing.window.isDestroyed()) {
            if (headless) {
                existing.window.hide()
                existing.window.setSkipTaskbar(true)
            } else {
                existing.window.show()
                existing.window.setSkipTaskbar(false)
                existing.window.focus()
            }

            return
        }

        const window = createFn(headless)
        windows.set(name, {
            open: openManager,
            close: () => {
                if (!window.isDestroyed()) {
                    window.close()
                }
            },
            window: window,
        })

        window.on('close', (event) => {
            if (name === me) {
                canClose = true
            }
            if (!canClose) {
                event.preventDefault()
                openManager(true)
            }
        })

        window.on('closed', () => {
            closeFn?.(window)
            const info = windows.get(name)
            if (info) {
                windows.set(name, {
                    ...info,
                    window: null
                })
            }
        })
    }

    windows.set(name, {
        open: openManager,
        close: () => {
            const info = windows.get(name)
            if (info?.window && !info.window.isDestroyed()) {
                if (canClose) {
                    info.window.close()
                } else {

                }
            }
        },
        window: null
    })
}

const me = 'me'
const deepseek = 'deepseek'
const yiyan = 'yiyan'
const doubao = 'doubao'
const kimi = 'kimi'
console.log('all window', me, deepseek, yiyan, doubao, kimi)
console.log('all create', createMe, createDeepseek, createYiyan, createDoubao, createKimi)

// registerWindow(yiyan, createYiyan)
// registerWindow(doubao, createDoubao)
// registerWindow(kimi, createKimi)
registerWindow(deepseek, createDeepseek)
registerWindow(me, createMe, () => {
    for (const [name, info] of windows.entries()) {
        if (name === me) {
            continue
        }
        info.close()
    }
})

const openAll = () => {
    windows.get(deepseek)?.open(true)
    windows.get(me)?.open(false)
}

app.whenReady().then(() => {
    openAll()

    ipcMain.on('chat', (_, message) => {
        windows.get(message.to)?.window?.webContents.send('chat', message)
    })

    ipcMain.on('open', (_, message) => {
        windows.get(message.to)?.open(false)
    })

    ipcMain.on('close', (_, message) => {
        windows.get(message.to)?.open(true)
        // windows.get(message.to)?.close()
    })

    ipcMain.on('status', (_, message) => {
        console.log('status', message)
    })
})

app.on('activate', () => {
    openAll()
    canClose = false
})

app.on('window-all-closed', () => {
    console.log('window-all-closed')
    if (process.platform !== 'darwin') app.quit()
})