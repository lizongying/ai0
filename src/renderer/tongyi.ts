import {ASSISTANTS, USER} from '../constants.ts'

const {TONGYI} = ASSISTANTS

const assistant = TONGYI
const hookRequest = () => {
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
            try {
                const response = Reflect.apply(target, thisArg, argumentsList)
                return response.then(async (response: Response) => {
                    const clonedResponse = response.clone()
                    console.log('clonedResponse.url', clonedResponse.url)
                    if (clonedResponse.url.includes('conversation')) {
                        console.log('Response intercepted:', clonedResponse.url)

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
                                })
                            }
                        }
                    }
                    if (clonedResponse.url.includes('pc/suggest/get')) {
                        console.log('Response intercepted:', clonedResponse.url)

                        try {
                            const parsedData: any = clonedResponse.json()

                            const recommendedQuestions = parsedData?.data?.recommendedQuestions
                            if (Array.isArray(recommendedQuestions) && recommendedQuestions.length > 0) {
                                for (const recommend of recommendedQuestions) {
                                    window.electronAPI.sendMessage('chat', <MessageChat>{
                                        from: assistant.id,
                                        to: window.electronAPI.from() || USER,
                                        data: `data: {"chat_prompt": "${recommend}"}`,
                                    })
                                }
                            }
                        } catch (error) {
                            console.error(error);
                        }
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
            if (thisArg._requestUrl.includes('pc/suggest/get')) {
                const originalOnReadyStateChange = thisArg.onreadystatechange
                thisArg.onreadystatechange = () => {
                    if (originalOnReadyStateChange) {
                        originalOnReadyStateChange.apply(thisArg)
                    }
                    if (thisArg.readyState === 3 || thisArg.readyState === 4) {
                        try {
                            const parsedData: any = JSON.parse(thisArg.responseText)

                            const recommendedQuestions = parsedData?.data?.recommendedQuestions
                            if (Array.isArray(recommendedQuestions) && recommendedQuestions.length > 0) {
                                for (const recommend of recommendedQuestions) {
                                    window.electronAPI.sendMessage('chat', <MessageChat>{
                                        from: assistant.id,
                                        to: window.electronAPI.from() || USER,
                                        data: `data: {"chat_prompt": "${recommend}"}`,
                                    })
                                }
                            }
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
console.log('hookRequest')