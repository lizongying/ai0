import {ASSISTANTS, USER} from '../constants.ts'

const {DEEPSEEK} = ASSISTANTS
const assistant = DEEPSEEK

const hookRequest = () => {
    const originalOpen = window.XMLHttpRequest.prototype.open
    window.XMLHttpRequest.prototype.open = new Proxy(originalOpen, {
        apply: function (target, thisArg, argumentsList) {
            const [, url] = argumentsList
            thisArg._requestUrl = url
            return Reflect.apply(target, thisArg, argumentsList)
        },
    })

    const originalSend = XMLHttpRequest.prototype.send
    XMLHttpRequest.prototype.send = new Proxy(originalSend, {
        apply: (target, thisArg, argumentsList) => {
            if (thisArg._requestUrl === '/api/v0/chat/completion') {
                const originalOnReadyStateChange = thisArg.onreadystatechange
                thisArg.onreadystatechange = () => {
                    if (originalOnReadyStateChange) {
                        originalOnReadyStateChange.apply(thisArg)
                    }
                    if (thisArg.readyState === 3 || thisArg.readyState === 4) {
                        const data = thisArg.responseText.slice(thisArg.lastDataIndex || 0)
                        thisArg.lastDataIndex = thisArg.responseText.length
                        window.electronAPI.sendMessage('chat', <MessageChat>{
                            from: assistant.id,
                            to: window.electronAPI.from() || USER,
                            data: data,
                        })
                    }
                }
            }
            return Reflect.apply(target, thisArg, argumentsList)
        },
    })
}

hookRequest()