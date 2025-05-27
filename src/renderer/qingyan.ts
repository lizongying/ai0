import {ASSISTANTS, USER} from '../constants'

const {QINGYAN} = ASSISTANTS

const assistant = QINGYAN
const hookRequest = () => {
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
            try {
                const response = Reflect.apply(target, thisArg, argumentsList)
                return response.then(async (response: Response) => {
                    const clonedResponse = response.clone()
                    if (clonedResponse.url.includes('assistant/stream')) {
                        console.log('Response intercepted:', clonedResponse.url)

                        const reader = clonedResponse.body?.getReader()
                        const decoder = new TextDecoder()

                        if (reader) {
                            window.API.sendMessage('chat', <MessageChat>{
                                from: assistant.id,
                                to: USER,
                                data: '[NEW]',
                            })
                            while (true) {
                                const {done, value} = await reader.read()
                                if (done) break

                                const chunk = decoder.decode(value, {stream: true})
                                // console.log('Received chunk:', chunk)

                                window.electronAPI.sendMessage('chat', <MessageChat>{
                                    from: assistant.id,
                                    to: USER,
                                    data: chunk,
                                });
                            }
                        }
                    }

                    return response
                })
            } catch (error) {
                console.error('Fetch error:', error)
            }
        }
    })
}

hookRequest()
console.log('hookRequest')