import {ASSISTANTS, USER} from '../constants'

const {KIMI} = ASSISTANTS
const assistant = KIMI.id

const hookRequest = () => {
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
            try {
                const response = Reflect.apply(target, thisArg, argumentsList)
                return response.then(async (response: Response) => {
                    const clonedResponse = response.clone()
                    if (clonedResponse.url.includes('completion/stream') || clonedResponse.url.includes('chat/recommend-prompt')) {
                        console.log('Response intercepted:', clonedResponse.url)

                        const reader = clonedResponse.body?.getReader()
                        const decoder = new TextDecoder()

                        if (reader) {
                            while (true) {
                                const {done, value} = await reader.read()
                                if (done) break

                                const chunk = decoder.decode(value, {stream: true})
                                console.log('Received chunk:', chunk)

                                window.electronAPI.sendMessage('chat', {
                                    from: assistant,
                                    to: USER,
                                    data: chunk,
                                })
                            }
                            window.electronAPI.sendMessage('chat', {
                                from: assistant,
                                to: USER,
                                data: '[DONE]',
                            })
                        }
                    }

                    return response
                })
            } catch (e) {
                console.error('error:', e)
            }
        }
    })
}

hookRequest()