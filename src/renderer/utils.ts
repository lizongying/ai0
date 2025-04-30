const getImageUrl = (name: string) => {
    return new URL(`./assets/${name}`, import.meta.url).href
}

export {
    getImageUrl
}
