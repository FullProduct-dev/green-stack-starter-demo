import { isEmpty } from './commonUtils'
import { isValidNumber } from './numberUtils'
import { getProperty, setProperty, deleteProperty, hasProperty, deepKeys } from 'dot-prop'
import { EnumLike } from 'zod'

/* --- Reexports ------------------------------------------------------------------------------- */

export { getProperty, setProperty, deleteProperty, hasProperty, deepKeys }

export { createLookup } from './arrayUtils'

/** --- parseUrlParamsObject() ----------------------------------------------------------------- */
/** -i- Parses object property values like "1" to 1, and "true" to true.
 ** Keys with '.' in them will be treated and parsed like objects
 ** Key with '[' or ']' in them will be treated and parsed like arrays */
export const parseUrlParamsObject = (
    objToValidate: ObjectType<any$Unknown> = {},
    ignoredKeys: string[] = []
): ObjectType => {
    const obj: typeof objToValidate = {}
    Object.keys(objToValidate).map((propKey) => {
        // Util
        const parseVal = (val: any$Unknown) => {
            // Normalize 'true' / 'false' to their boolean values
            if (['true', 'false'].includes(val)) val = JSON.parse(val)
            // Normalize stringified numbers to actual number
            else val = Array.isArray(val) || !isValidNumber(val) ? val : +val
            // Keep Dates as is
            if (val instanceof Date) return val
            // Keep Buffers as is
            if (typeof window === 'undefined' && val instanceof Buffer) return val
            // In case of nested objects, use recursion
            if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
                val = parseUrlParamsObject(val, ignoredKeys)
            }
            // Return
            return val
        }
        // Add value under same key to obj
        let val = parseVal(objToValidate[propKey])
        const shouldIgnore = ignoredKeys.includes(propKey)
        if (shouldIgnore) val = objToValidate[propKey]
        else setProperty(obj, propKey, val)
    })
    return obj
}

/** --- buildUrlParamsObject() ----------------------------------------------------------------- */
/** -i- Builds an object with all array and object keys flattened.
 ** Essentially the opposite of `parseUrlParamsObject()`
 * @example { arr: [0, 2] } // -> { 'arr[0]': 0, 'arr[1]': 2 }
 * @example { obj: { prop: true } } // -> { 'obj.prop': true } */
export const buildUrlParamsObject = (obj: ObjectType<any$Unknown> = {}) => {
    const newObj: ObjectType<any$Unknown> = {}
    deepKeys(obj).map((key) => {
        const val = getProperty(obj, key)
        if (isEmpty(val)) deleteProperty(newObj, key)
        else newObj[key] = val
    })
    return newObj
}

/** --- swapEntries() -------------------------------------------------------------------------- */
/** -i- Swaps the object's keys and values while keeping the types intact. Handy for object enums. */
export const swapEntries = <T extends EnumLike>(obj: T): { [K in keyof T as T[K]]: K } => {
    const swapped: { [K in keyof T as T[K]]: K } = {} as { [K in keyof T as T[K]]: K }
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            // @ts-ignore
            swapped[obj[key]] = key
        }
    }
    return swapped
}

/** --- createKey() ---------------------------------------------------------------------------- */
/** -i- Turns an object into a string by deeply rendering both keys & values to string and joining them */
export const createKey = (obj: ObjectType<any$Unknown> = {}, separator = '-'): string => {
    if (!Array.isArray(obj) && typeof obj !== 'object') return `${obj}`
    const valueKeys = Object.entries(obj).map(([key, val]) => {
        let value = val
        if (value === null) value = 'null'
        if (typeof value === 'object') value = createKey(value)
        if (Array.isArray(value)) {
            const itemType = typeof value[0]
            if (itemType === 'object') value = value.map((v) => createKey(v))
            value = value.join(separator)
        }
        if (Array.isArray(obj)) return `${value || 'x'}`
        return `${key}${separator}${value || 'x'}`
    })
    return valueKeys.sort().join(separator)
}
