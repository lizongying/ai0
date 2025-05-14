import {type MarkedExtension} from 'marked'

const rendererExcel = {
    space(): string {
        return ''
    },
    code(): string {
        return ''
    },
    blockquote(): string {
        return ''
    },
    html(): string {
        return ''
    },
    heading(): string {
        return ''
    },
    hr(): string {
        return ''
    },
    list(): string {
        return ''
    },
    listitem(): string {
        return ''
    },
    checkbox(): string {
        return ''
    },
    paragraph(): string {
        return ''
    },
    // table(token: Tokens.Table): string{
    //     return ''
    // },
    // tablerow({ text }: Tokens.TableRow): string{
    //     return ''
    // },
    // tablecell(token: Tokens.TableCell): string{
    //     return ''
    // },
    /**
     * span level renderer
     */
    strong(): string {
        return ''
    },
    em(): string {
        return ''
    },
    codespan(): string {
        return ''
    },
    br(): string {
        return ''
    },
    del(): string {
        return ''
    },
    link(): string {
        return ''
    },
    image(): string {
        return ''
    },
    // text(token: Tokens.Text | Tokens.Escape): string{
    //     return ''
    // },
}


const markedExcel = (): MarkedExtension => {
    return {
        renderer: rendererExcel
    }
}

export {
    markedExcel
}