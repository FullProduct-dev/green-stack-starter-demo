/**
 * Polyfills that must run before any other app code.
 * This file is imported first in index.js.
 */

// react-native-worklets (used by Reanimated) - _toString is set on worklet runtimes
// but not on the main JS thread. When valueUnpacker hits an unrecognized type, it needs this.
if (typeof globalThis._toString !== 'function') {
  globalThis._toString = (value) => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'object') return Object.prototype.toString.call(value)
    return String(value)
  }
}
