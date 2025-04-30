const {contextBridge, ipcRenderer} = require('electron')


// 定义允许的 IPC 通道白名单
const validChannels = ['mqtt-message', 'from-child', 'from-child']

// 暴露安全的 API 到渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: any, data: any) => {
        if (!validChannels.includes(channel)) return
        ipcRenderer.send(channel, data);
    },
    onMessage: (channel: any, callback: any) => {
        if (!validChannels.includes(channel)) return
        ipcRenderer.on(channel, (_: any, ...args: any[]) => callback(...args))
    },
})