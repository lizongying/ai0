import {ASSISTANTS, USER} from '../constants.ts'

const {MITA} = ASSISTANTS
const assistant = MITA

const hookRequest = () => {
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
            try {
                const response = Reflect.apply(target, thisArg, argumentsList)
                return response.then(async (response: Response) => {
                    const clonedResponse = response.clone()
                    if (clonedResponse.url.includes('api/searchV2')) {
                        const reader = clonedResponse.body?.getReader()
                        const decoder = new TextDecoder()

                        if (reader) {
                            while (true) {
                                const {done, value} = await reader.read()
                                if (done) break

                                const chunk = decoder.decode(value, {stream: true})
                                // console.log('Received chunk:', chunk)

                                window.electronAPI.sendMessage('chat', <MessageChat>{
                                    from: assistant.id,
                                    to: window.electronAPI.from() || USER,
                                    data: chunk,
                                });
                            }
                        }
                    }

                    return response
                })
            } catch (_) {
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
            if (thisArg._requestUrl.includes('api/searchV2')) {
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

    const originalEventSource = window.EventSource

    window.EventSource = new Proxy(originalEventSource, {
        construct(target, argumentsList, newTarget) {
            const instance = Reflect.construct(target, argumentsList, newTarget)
            instance.addEventListener('message', function (e: any) {
                // console.log('e.data', e.data)
                window.electronAPI.sendMessage('chat', <MessageChat>{
                    from: assistant.id,
                    to: window.electronAPI.from() || USER,
                    data: e.data,
                })
            })

            return instance
        }
    })
}

hookRequest()