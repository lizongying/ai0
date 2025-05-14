let counter = Number.MAX_SAFE_INTEGER

const decrement = () => {
    return --counter
}

const getCounter = () => {
    return counter
}

export {
    decrement,
    getCounter,
}