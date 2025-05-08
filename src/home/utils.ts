const getImageUrl = (name: string) => {
    if (name === '') return ''
    if (name.startsWith('blob') || name.startsWith('data') || name.startsWith('file') || name.startsWith('http')) return name
    return new URL(`./assets/${name}`, import.meta.url).href
}

const getTimestamp = Date.now

const parseText = (text: string): Result[] => {
    const lines0 = text.split('\n\n')
    const rs: Result[] = []

    for (const line0 of lines0) {
        const lines = line0.split('\n')

        let result: Result | null = null
        for (const line of lines) {
            if (!line) {
                continue
            }
            if (line.startsWith('event:')) {
                if (result === null) {
                    result = {}
                }
                result.event = line.slice(line.indexOf(':') + 2)
            } else if (line.startsWith('data:')) {
                if (result === null) {
                    result = {}
                }
                const dataStr = line.slice(line.indexOf(':') + 2)
                // console.log('line:', line, 'dataStr:', dataStr)
                try {
                    result.data = JSON.parse(dataStr)
                } catch (e) {
                    console.error('Failed to parse data:', e, text)
                    result.data = {}
                }
            }
        }
        if (result) {
            rs.push(result)
        }
    }

    return rs
}


export {
    getImageUrl,
    getTimestamp,
    parseText,
}
