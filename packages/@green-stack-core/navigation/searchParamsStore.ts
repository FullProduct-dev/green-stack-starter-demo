
/* --- Search Params Store -------------------------------------------------------------------- */

// -i- Lightweight pub/sub store for shallow URL search param changes. (Web only)
// -i- Bridges `window.history.replaceState()` updates to React via `useSyncExternalStore`.

/* --- Constants ------------------------------------------------------------------------------- */

export const SHALLOW_PARAMS_CHANGE_EVENT = 'shallow-params-change'

/** --- getSearchParamsSnapshot() -------------------------------------------------------------- */
/** -i- Returns the current `window.location.search` string, or `''` during SSR */
export const getSearchParamsSnapshot = () => {
    if (typeof window === 'undefined') return ''
    return window.location.search
}

/** --- getServerSearchParamsSnapshot() -------------------------------------------------------- */
/** -i- Server snapshot for `useSyncExternalStore` — always returns `''` */
export const getServerSearchParamsSnapshot = () => ''

/** --- subscribeToSearchParams() -------------------------------------------------------------- */
/** -i- Subscribes to shallow search-param changes (and browser back/forward).
 ** Returns an unsubscribe function, compatible with `useSyncExternalStore`. */
export const subscribeToSearchParams = (callback: () => void) => {
    window.addEventListener(SHALLOW_PARAMS_CHANGE_EVENT, callback)
    window.addEventListener('popstate', callback)
    return () => {
        window.removeEventListener(SHALLOW_PARAMS_CHANGE_EVENT, callback)
        window.removeEventListener('popstate', callback)
    }
}
