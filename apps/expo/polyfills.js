// -i- Polyfills that must run before any other app code
// -i- This file is imported first in index.js

/* --- Reanimated ------------------------------------------------------------------------------ */
// -i- Reanimated v4 + react-native-worklets: the globalThis._toString polyfill that was used for
if (typeof globalThis._toString !== 'function') {
    globalThis._toString = (value) => {
        if (value === null) return 'null'
        if (value === undefined) return 'undefined'
        if (typeof value === 'object') return Object.prototype.toString.call(value)
        return String(value)
    }
}
