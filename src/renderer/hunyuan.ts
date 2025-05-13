import {ASSISTANTS, USER} from '../constants'

const {HUNYUAN} = ASSISTANTS
const user = HUNYUAN.id

const hookRequest = () => {
    const originalFetch = window.fetch
    window.fetch = new Proxy(originalFetch, {
        apply: function (target, thisArg, argumentsList) {
            try {
                const response = Reflect.apply(target, thisArg, argumentsList)
                return response.then(async (response: Response) => {
                    const clonedResponse = response.clone()
                    if (
                        clonedResponse.url.includes('triton_image/hunyuan_text_chat')
                        || clonedResponse.url.includes('triton_image/demo_text_chat')
                    ) {
                        const reader = clonedResponse.body?.getReader()
                        const decoder = new TextDecoder()

                        if (reader) {
                            window.electronAPI.sendMessage('chat', {
                                from: user,
                                to: USER,
                                data: 'NEW',
                            })
                            while (true) {
                                const {done, value} = await reader.read()
                                if (done) break

                                const chunk = decoder.decode(value, {stream: true})
                                console.log('Received chunk:', chunk)

                                window.electronAPI.sendMessage('chat', {
                                    from: user,
                                    to: USER,
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
}

hookRequest()