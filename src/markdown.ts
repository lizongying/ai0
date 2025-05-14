import {Marked} from 'marked'
import markedPlaintify from 'marked-plaintify'

import markedShiki from 'marked-shiki'
import {codeToHtml} from 'shiki'
import {markedExcel} from './shared/table.ts'

class Markdown {
    private marked: Marked

    constructor(type?: string) {
        this.marked = new Marked({gfm: true})

        switch (type) {
            case 'html':
                break
            case 'excel':
                this.marked.use(markedExcel())
                break
            case 'plainText':
                this.marked.use(markedPlaintify())
                break
            case 'highlight':
                this.marked.use(markedShiki({
                    async highlight(code, lang) {
                        return codeToHtml(code, {lang, theme: 'github-dark'})
                    },
                }))
                break
            default:
                break
        }
    }

    render(md: string) {
        return this.marked.parse(md)
    }
}

export {Markdown}