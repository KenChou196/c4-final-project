export function customLog (message: string, type: string) {
    const prefix = 'udacity-logger ===> : '
    switch (type) {
        case 'log':
            console.log(prefix + message)
            break;
        case 'warning':
            console.warn(prefix + message)
            break;
        case 'error':
            console.error(prefix + message)
            break;
        default:
            console.log(prefix + message)
            break;
    }
}