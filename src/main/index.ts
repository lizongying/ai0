import {app, BrowserWindow, ipcMain} from 'electron'
import path from 'path'
import {fileURLToPath} from 'url'
import {join} from 'node:path'
import {readFileSync} from 'node:fs'
import {ASSISTANTS, GROUPS, USER} from '../constants.ts'

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
            nodeIntegration: true,
            contextIsolation: true,
        },
    })

    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000').then()
    } else {
        win.loadFile(path.join(__dirname, '../home/index.html')).then()
    }
    win.webContents.openDevTools()
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
            sandbox: true,
            webSecurity: true,
        },
    })

    win.webContents.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36')

    win.loadURL(url).then(() => {
        win.webContents
            .executeJavaScript(readFileSync(join(__dirname, `../renderer/${name}.js`), 'utf-8'))
            .then()
    })
    win.webContents.openDevTools()
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

        const window = name === USER ? createMe(headless) : create(name, url, headless)
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
            if (name === USER) {
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

registerWindow(USER, '', () => {
    for (const [name, info] of windows.entries()) {
        if (name === USER) {
            continue
        }
        info.close()
    }
})

Object.values(ASSISTANTS).forEach(v => {
    if (v.enable) {
        registerWindow(v.id, v.link)
    }
})

const openAll = () => {
    windows.get(USER)?.open(false)

    Object.values(ASSISTANTS).forEach(v => {
        if (v.enable) {
            windows.get(v.id)?.open(true)
        }
    })
}

app.whenReady().then(() => {
    openAll()

    ipcMain.on('chat', (_, message: MessageChat) => {
        let to = message.to
        if (to === GROUPS.ALL.id) {
            to = USER
        }
        windows.get(to)?.window?.webContents.send('chat', message)
    })

    ipcMain.on('file', (_, message: MessageFile) => {
        windows.get(message.to)?.window?.webContents.send('file', message)
    })

    ipcMain.on('open', (_, message: MessageOpen) => {
        windows.get(message.to)?.open(false)
    })

    ipcMain.on('close', (_, message: MessageClose) => {
        windows.get(message.to)?.open(true)
    })

    ipcMain.on('status', (_, message: MessageStatus) => {
        windows.get(USER)?.window?.webContents.send('status', message)
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