import {ASSISTANTS, USER} from '../constants.ts'

const {ZHIDA} = ASSISTANTS

const assistant = ZHIDA
let messageId = ''
const hookRequest = () => {
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
            try {
                console.log('target', target)
                const response = Reflect.apply(target, thisArg, argumentsList)
                return response.then(async (response: Response) => {
                    const clonedResponse = response.clone()
                    console.log('clonedResponse.url', clonedResponse.url)
                    if (clonedResponse.url.includes('ai_chat/polling_message_v2')) {
                        console.log('Response intercepted:', clonedResponse.url)
                        const currentUrl = new URL(clonedResponse.url)
                        const newMessageId = currentUrl.searchParams.get('message_id') || ''
                        if (newMessageId != messageId) {
                            messageId = newMessageId
                        }

                        window.electronAPI.sendMessage('chat', <MessageChat>{
                            from: assistant.id,
                            to: window.electronAPI.from() || USER,
                            data: await clonedResponse.text(),
                        })
                    }

                    return response
                })
            } catch (error) {
                console.error('Fetch error:', error)
            }
        }
    })

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
            console.log('thisArg._requestUrl', thisArg._requestUrl)
            if (thisArg._requestUrl.includes('ai_chat/polling_message_v2')) {
                const originalOnReadyStateChange = thisArg.onreadystatechange
                thisArg.onreadystatechange = () => {
                    if (originalOnReadyStateChange) {
                        originalOnReadyStateChange.apply(thisArg)
                    }
                    if (thisArg.readyState === 3 || thisArg.readyState === 4) {
                        try {
                            window.electronAPI.sendMessage('chat', <MessageChat>{
                                from: assistant.id,
                                to: window.electronAPI.from() || USER,
                                data: thisArg.responseText,
                            })
                        } catch (error) {
                            console.error(error);
                        }
                    }
                }
            }
            return Reflect.apply(target, thisArg, argumentsList)
        },
    })
}

hookRequest()