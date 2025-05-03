const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: any, data: any) => {
        ipcRenderer.send(channel, data);
    },
    onMessage: (channel: any, callback: any) => {
        ipcRenderer.on(channel, (_: any, ...args: any[]) => callback(...args))
    },
})

document.addEventListener('DOMContentLoaded', () => {
})