export {isNil} from 'ramda'

export const createEnumState = (states = []) => states.reduce(function(result, item, index){
    result[item] = index
    return result
},{})