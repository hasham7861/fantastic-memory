export const sleep = function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export {isNil, isEmpty, keysIn} from 'ramda'
