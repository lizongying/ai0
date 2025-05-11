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
        win.loadFile(path.join(__dirname, '../home/index.html')).then()
    }
    // win.webContents.openDevTools()
    return win
}

const create = (name: string, url: string, headless: boolean) => {
    const win = new BrowserWindow({
        width: 1000,
        height: 600,
        show: !headless,
        skipTaskbar: headless,
        webPreferences: {
            preload: path.join(__dirname, `../preload/${name}.js`),
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: true,
        },
    })

    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    win.loadURL(url).then(() => {
        win.webContents
            .executeJavaScript(readFileSync(join(__dirname, `../renderer/${name}.js`), 'utf-8'))
            .then()
    })
    // win.webContents.openDevTools()
    return win
}

let canClose = false

const registerWindow = (name: string, url: string, closeFn?: (win: BrowserWindow) => void) => {
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

        const window = name === me ? createMe(headless) : create(name, url, headless)
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
const zhida = 'zhida'
const tongyi = 'tongyi'
const hunyuan = 'hunyuan'
console.log('all window', me, deepseek, yiyan, doubao, kimi, zhida)

// registerWindow(yiyan, 'https://yiyan.baidu.com/')
registerWindow(doubao, 'https://www.doubao.com/chat/')
registerWindow(kimi, 'https://kimi.moonshot.cn/chat/')
registerWindow(deepseek, 'https://chat.deepseek.com/')
// registerWindow(zhida, 'https://zhida.zhihu.com/')
registerWindow(tongyi, 'https://www.tongyi.com/qianwen/')
registerWindow(hunyuan, 'https://llm.hunyuan.tencent.com/#/chat')
registerWindow(me, '', () => {
    for (const [name, info] of windows.entries()) {
        if (name === me) {
            continue
        }
        info.close()
    }
})

const openAll = () => {
    windows.get(me)?.open(false)
    windows.get(deepseek)?.open(true)
    windows.get(doubao)?.open(true)
    windows.get(kimi)?.open(true)
    windows.get(tongyi)?.open(true)
    windows.get(hunyuan)?.open(true)
    // windows.get(zhida)?.open(true)
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
        windows.get(me)?.window?.webContents.send('status', message)
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