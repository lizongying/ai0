import {Marked} from 'marked'
import markedPlaintify from 'marked-plaintify'

import markedShiki from 'marked-shiki'
import {codeToHtml} from 'shiki'
import {markedExcel} from './shared/table.ts'
import hljs from 'highlight.js';


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
                        try {
                            return await codeToHtml(code, {lang, theme: 'github-dark'})
                        } catch (error) {
                            if (hljs.getLanguage(lang)) {
                                return hljs.highlight(code, {language: lang}).value
                            } else {
                                return `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`
                            }
                        }
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

function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

export {Markdown}