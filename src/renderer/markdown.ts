import {Marked} from 'marked'
import markedPlaintify from 'marked-plaintify'

import markedShiki from 'marked-shiki'
import {codeToHtml} from 'shiki'

class Markdown {
    private marked: Marked

    constructor(plainText: boolean, highlight: boolean) {
        this.marked = new Marked({gfm: true})
        if (plainText) {
            this.marked.use(markedPlaintify())
        }

        if (highlight) {
            this.marked.use(markedShiki({
                async highlight(code, lang) {
                    return codeToHtml(code, {lang, theme: 'github-dark'})
                },
            }))
        }
    }

    render(md: string) {
        return this.marked.parse(md)
    }
}

export {Markdown}