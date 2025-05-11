const {ipcRenderer, contextBridge} = require('electron')
import translations from '../i18n'
import {Markdown} from '../markdown.ts'

let t = translations.hant

const lineColor = 'currentColor'
const fullColor = 'none'
const user = 'hunyuan'
const inputSelector = '.message-sender-textarea>.textarea-area>textarea[autofocus="autofocus"]'

const chat = (msg: String) => {
    ipcRenderer.send('chat', {from: user, to: 'me', data: msg})
}

ipcRenderer.on('chat', (_: any, message: any) => {
    console.log('Received from chat:', message)
    const home = document.querySelector('.t2t-home') as HTMLTextAreaElement
    const index = window.getComputedStyle(home).display === 'none' ? 1 : 0

    const input = document.querySelectorAll(inputSelector)[index] as HTMLTextAreaElement
    input.focus()
    input.value = ''
    document.execCommand('insertText', false, message.content)
    const button = document.querySelectorAll('.action-area .action-btn')[index];
    setTimeout(() => {
        (button as HTMLElement).click()
    }, 500)
})

contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (channel: any, data: any) => {
        ipcRenderer.send(channel, data)
    },
    onMessage: (channel: any, callback: any) => {
        ipcRenderer.on(channel, (_: any, ...args: any[]) => callback(...args))
    },
})

document.addEventListener('DOMContentLoaded', () => {
    observerButtons()
    const input = document.querySelector(inputSelector)
    if (input) {
        if (!ready) {
            ipcRenderer.send('status', {from: user, status: 'ready'})
            ready = true
        }
    } else {
        observerInput()
    }

    const sheet = new CSSStyleSheet()
    sheet.replaceSync(`
    .ai0>svg {
        fill: none;
    }
    `)
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
})

const observerButtons = () => {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const buttons = document.querySelectorAll('.ds-flex>.ds-flex')
                if (buttons) {
                    addButton(buttons)
                }
            }
        }
    })

    observer.observe(document, {
        childList: true,
        subtree: true
    })
}

let ready = false
const observerInput = () => {
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                const input = document.querySelector(inputSelector)
                if (input) {
                    if (!ready) {
                        ipcRenderer.send('status', {from: user, status: 'ready'})
                        ready = true
                    }
                    observer.disconnect()
                }
            }
        }
    })

    observer.observe(document, {
        childList: true,
        subtree: true
    })
}

const addButton = (buttons: NodeListOf<Element>) => {
    buttons.forEach(item => {
        if (!item.hasAttribute('html') && item.childElementCount === 4) {
            const doc = addDoc()
            item.appendChild(doc)
            addPopup(doc, t.doc)

            // const excel = addExcel()
            // item.appendChild(excel)
            // addPopup(excel, '導出為excel')

            // const pdf = addPdf()
            // item.appendChild(pdf)
            // addPopup(pdf, '導出為pdf')

            const txt = addTxt()
            item.appendChild(txt)
            addPopup(txt, t.txt)

            const download = addDownload()
            item.appendChild(download)
            addPopup(download, t.download)

            item.setAttribute('html', '')
        }
    })
}

const addDoc = () => {
    let div = document.createElement('div')
    div.className = 'ds-icon-button'
    div.setAttribute('ai0-doc', '')
    div.setAttribute('tabindex', '0')
    div.style.setProperty('--ds-icon-button-text-color', '#CDD4DF')
    div.style.setProperty('--ds-icon-button-size', '20px')
    div.innerHTML = `<div class="ds-icon ai0" style="font-size: 20px; width: 20px; height: 20px;"><svg width="20" height="20" viewBox="0 0 48 48" fill="${fullColor}" xmlns="http://www.w3.org/2000/svg"><path d="M10 38V44H38V38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 20V14L30 4H10V20" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 4V14H38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 12H20" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><rect x="4" y="20" width="40" height="18" rx="2" stroke="${lineColor}" stroke-width="4" stroke-linejoin="round"/><path d="M10 25V33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><path d="M10 25H12C14.2091 25 16 26.7909 16 29V29C16 31.2091 14.2091 33 12 33H10" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="24" cy="29" rx="3" ry="4" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 25H36C33.7909 25 32 26.7909 32 29V29C32 31.2091 33.7909 33 36 33H38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    return div
}

// const addExcel = () => {
//     let div = document.createElement('div')
//     div.className = 'ds-icon-button'
//     div.setAttribute('tabindex', '0')
//     div.style.setProperty('--ds-icon-button-text-color', '#CDD4DF')
//     div.style.setProperty('--ds-icon-button-size', '20px')
//     div.innerHTML = `<div class="ds-icon ai0" style="font-size: 20px; width: 20px; height: 20px;"><svg width="20" height="20" viewBox="0 0 48 48" fill="${fullColor}" xmlns="http://www.w3.org/2000/svg"><path d="M8 15V6C8 4.89543 8.89543 4 10 4H38C39.1046 4 40 4.89543 40 6V42C40 43.1046 39.1046 44 38 44H10C8.89543 44 8 43.1046 8 42V33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 15H34" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><path d="M28 23H34" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><path d="M28 31H34" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><rect x="4" y="15" width="18" height="18" fill="${fullColor}" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 21L16 27" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 21L10 27" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
//     return div
// }

// const addPdf = () => {
//     let div = document.createElement('div')
//     div.className = 'ds-icon-button'
//     div.setAttribute('tabindex', '0')
//     div.style.setProperty('--ds-icon-button-text-color', '#CDD4DF')
//     div.style.setProperty('--ds-icon-button-size', '20px')
//     div.innerHTML = `<div class="ds-icon ai0" style="font-size: 20px; width: 20px; height: 20px;"><svg width="20" height="20" viewBox="0 0 48 48" fill="${fullColor}" xmlns="http://www.w3.org/2000/svg"><path d="M10 38V44H38V38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 20V14L30 4H10V20" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 4V14H38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="20" width="40" height="18" rx="2" stroke="${lineColor}" stroke-width="4" stroke-linejoin="round"/><path d="M21 25V33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><path d="M10 25V33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><path d="M32 33V25H37" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 30H37" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 25H13.5C14.8807 25 16 26.1193 16 27.5V27.5C16 28.8807 14.8807 30 13.5 30H10" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 25H23C25.2091 25 27 26.7909 27 29V29C27 31.2091 25.2091 33 23 33H21" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 12H20" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/></svg></div>`
//     return div
// }

const addTxt = () => {
    let div = document.createElement('div')
    div.className = 'ds-icon-button'
    div.setAttribute('ai0-txt', '')
    div.setAttribute('tabindex', '0')
    div.style.setProperty('--ds-icon-button-text-color', '#CDD4DF')
    div.style.setProperty('--ds-icon-button-size', '20px')
    div.innerHTML = `<div class="ds-icon ai0" style="font-size: 20px; width: 20px; height: 20px;"><svg width="20" height="20" viewBox="0 0 48 48" fill="${fullColor}" xmlns="http://www.w3.org/2000/svg"><path d="M10 38V44H38V38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M38 20V14L30 4H10V20" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 4V14H38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 12H20" stroke="${lineColor}" stroke-width="4" stroke-linecap="round"/><rect x="4" y="20" width="40" height="18" rx="2" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 25L27 33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 25L21 33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M13 25V33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 25H13H16" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M35 25V33" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M32 25H35H38" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    return div
}

const addDownload = () => {
    let div = document.createElement('div')
    div.className = 'ds-icon-button'
    div.setAttribute('ai0-download', '')
    div.setAttribute('tabindex', '0')
    div.style.setProperty('--ds-icon-button-text-color', '#CDD4DF')
    div.style.setProperty('--ds-icon-button-size', '20px')
    div.innerHTML = `<div class="ds-icon ai0" style="font-size: 20px; width: 20px; height: 20px;"><svg width="20" height="20" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 24.0083V42H42V24" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 23L24 32L15 23" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M23.9917 6V32" stroke="${lineColor}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`
    return div
}

const markdown = new Markdown(true, false)

const addPopup = (ele: Element, name: string) => {
    let popup = document.createElement('div')
    popup.className = 'ds-floating-position-wrapper ds-theme'
    popup.setAttribute('data-transform-origin', 'bottom')
    popup.style.setProperty('--ds-rgb-hover', '255 255 255 / 6%')
    popup.style.setProperty('font-size', 'var(--ds-font-size-m)')
    popup.style.setProperty('line-height', 'var(--ds-line-height-m)')
    popup.style.setProperty('z-index', '0')
    popup.innerHTML = ''
    document.body.appendChild(popup)
    ele.addEventListener('mouseover', () => {
        popup.style.setProperty('z-index', '1024')
        const rect = ele.getBoundingClientRect()
        popup.style.setProperty('left', rect.left - 23 + 'px')
        popup.style.setProperty('top', rect.top - 49 + 'px')
        popup.innerHTML = `<div class="ds-tooltip ds-tooltip--m ds-elevated ds-theme" style="--ds-rgb-hover: 255 255 255 / 6%; font-size: var(--ds-font-size-m); line-height: var(--ds-line-height-m);">${name}<div class="ds-tooltip__arrow ds-tooltip__arrow--soft" ds-floating-placement="top" style="left: 25px;"><svg class="ds-tooltip__soft-arrow" viewBox="0 0 47 13" fill="${fullColor}" xmlns="http://www.w3.org/2000/svg"><mask id="mask0_0_3329" maskUnits="userSpaceOnUse" x="0" y="0" width="47" height="13" style="mask-type: alpha;"><path fill-rule="evenodd" clip-rule="evenodd" d="M0 0.00316996C1.71249 0.00316996 3.42448 -0.00533022 5.13697 0.0131702C6.77598 0.0311706 8.61044 0.0566711 10.2055 0.658184C11.9284 1.3082 13.0691 2.44472 14.2168 3.78225C15.043 4.74427 16.666 6.79681 17.4563 7.78784C18.1031 8.60035 19.3692 10.2064 20.0605 10.9834C20.9308 11.9609 22.0064 12.9999 23.5005 12.9999C24.9946 12.9999 26.0697 11.9609 26.9395 10.9844C27.6308 10.2079 28.8969 8.60085 29.5442 7.78884C30.3335 6.79781 31.9565 4.74527 32.7832 3.78325C33.9329 2.44572 35.0716 1.3092 36.794 0.659184C38.3896 0.0591711 40.2245 0.0321706 41.8625 0.0141702C43.5755 -0.0043302 45.2875 0.00416998 47 0.00416998" fill="#FF0000"></path></mask><g mask="url(#mask0_0_3329)"><g clip-path="url(#clip0_0_3329)"><g filter="url(#filter0_b_0_3329)"><rect width="47" height="13" fill="${fullColor}" style="mix-blend-mode: color-dodge;"></rect></g></g></g><defs><filter id="filter0_b_0_3329" x="-50" y="-50" width="147" height="113" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB"><feFlood flood-opacity="0" result="BackgroundImageFix"></feFlood><feGaussianBlur in="BackgroundImageFix" stdDeviation="25"></feGaussianBlur><feComposite in2="SourceAlpha" operator="in" result="effect1_backgroundBlur_0_3329"></feComposite><feBlend mode="normal" in="SourceGraphic" in2="effect1_backgroundBlur_0_3329" result="shape"></feBlend></filter><clipPath id="clip0_0_3329"><rect width="47" height="13" fill="white"></rect></clipPath></defs></svg></div></div>`
    })
    ele.addEventListener('mouseout', () => {
        popup.style.setProperty('z-index', '0')
        popup.innerHTML = ''
    })
    ele.addEventListener('click', async () => {
        if (ele.hasAttribute('ai0-txt')) {
            const firstChild = ele.parentElement?.firstElementChild
            if (firstChild instanceof HTMLElement) {
                firstChild.click()
                const md = await navigator.clipboard.readText()
                console.log('md:', md)
                chat(md)
                try {
                    const txt = await markdown.render(md)
                    console.log('txt:', txt)
                    await navigator.clipboard.writeText(txt.replace(/\n+/g, '\n'))
                } catch (err) {
                    console.error(err)
                }
            }
        } else if (ele.hasAttribute('ai0-download')) {
            const firstChild = ele.parentElement?.firstElementChild
            if (firstChild instanceof HTMLElement) {
                firstChild.click()
                const md = await navigator.clipboard.readText()
                console.log('md:', md)
                chat(md)
                try {
                    downloadTextFile(md, md.split('\n')[0].slice(0, 10) + '.txt')
                } catch (err) {
                    console.error(err)
                }
            }
        } else if (ele.hasAttribute('ai0-doc')) {
            let markdownElement = ele.parentElement?.parentElement?.parentElement?.querySelector('.ds-markdown')
            if (markdownElement) {
                const clonedElement = markdownElement.cloneNode(true) as Element

                function traverseChildren(element: Element) {
                    element.removeAttribute('class')
                    element.removeAttribute('style')
                    element.childNodes.forEach(i => {
                        if (i instanceof Element) {
                            traverseChildren(i)
                        }
                    })
                }

                traverseChildren(clonedElement)

                const outerHTML = clonedElement.outerHTML
                const type = 'text/html'
                const clipboardItemData = {
                    [type]: new Blob([outerHTML], {type}),
                };
                try {
                    console.log('html:', outerHTML)
                    const clipboardItem = new ClipboardItem(clipboardItemData)
                    await navigator.clipboard.write([clipboardItem])
                } catch (err) {
                    console.error(err)
                }
            }
        }
    })
}

const downloadTextFile = (content: string, filename = '') => {
    const blob = new Blob([content], {type: 'text/plain'})

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename

    document.body.appendChild(a)
    a.click()

    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}