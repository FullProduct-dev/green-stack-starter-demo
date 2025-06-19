import { use } from 'react'

/** --- extractParams() ------------------------------------------------------------------------ */
/** -i- Unwraps param props if they're a promise */
export const extractParams = (params?: Record<string, unknown> | Promise<Record<string, unknown>>) => {
    // Unwrap the promise first?
    if (params instanceof Promise) return use(params as any as Promise<Record<string, unknown>>)
    // Otherwise, just return the params as an object
    return params || {}
}

/** --- universalRouteProps() ----------------------------------------------------------------- */
/** -i- Props wrapper to extract params and searchParams before spreading to <UniversalRouteScreen/> */
export const universalRouteProps = <T extends Record<string, unknown>>(
    props: T,
) => {
    // Treat params and searchParams as promises
    const { params, searchParams, ...regularProps } = props
    // Extract params and searchParams and mix them into the regular props
    return {
        ...regularProps,
        params: extractParams(params as Record<string, unknown> | Promise<Record<string, unknown>>),
        searchParams: extractParams(searchParams as Record<string, unknown> | Promise<Record<string, unknown>>),
    } as T & {
        params: Record<string, unknown>
        searchParams: Record<string, unknown>
    }
}
