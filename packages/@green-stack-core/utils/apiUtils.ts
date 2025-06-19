import type { NextApiRequest, GetServerSidePropsContext } from 'next'
import type { NextRequest } from 'next/server' // @ts-ignore
import CryptoJS from 'crypto-js'
import { parseUrlParamsObject } from './objectUtils'
import { isEmpty, warnOnce } from './commonUtils'

/* --- Types ----------------------------------------------------------------------------------- */

export type APISources = {
    query?: any
    body?: any
    cookies?: any
    params?: any
    args?: any
    context?: any
}

/** --- validateJSON() ------------------------------------------------------------------------- */
/** -i- Checks whether a json string is valid */
export const validateJSON = (maybeJSON: string) => {
    try {
        JSON.parse(maybeJSON)
        return true
    } catch (e) {
        return false
    }
}
  
/** --- parseIfJSON() -------------------------------------------------------------------------- */
/** -i- Attempt to parse a string if it's valid JSON */
export const parseIfJSON = (maybeJSON: string | any) => {
    return validateJSON(maybeJSON) ? JSON.parse(maybeJSON) : maybeJSON
}

/** --- getApiParam() -------------------------------------------------------------------------- */
/** -i- Gets a specific property by key from supplied (optional) API sources */
export const getApiParam = (key: string, apiSources: APISources) => {
    const { query, params, body, args, context } = apiSources
    const [result] = [params, query, body, args, context].map((src) => src?.[key]).filter(Boolean)
    return result
}

/** --- getApiParams() ------------------------------------------------------------------------- */
/** -i- Get multiple api params from supplied API sources */
export const getApiParams = (keys: string | string[], apiSources: APISources) => {
    const paramKeys = typeof keys === 'string' ? keys.split(' ') : keys
    return paramKeys.reduce((apiParams, paramKey) => {
        return { ...apiParams, [paramKey]: getApiParam(paramKey, apiSources) }
    }, {}) as { [key: string]: unknown }
}

/** --- getUrlParams() ------------------------------------------------------------------------- */
/** -i- Extract the query parameters from a url */
export const getUrlParams = (url: string) => {
    const queryString = url.split('?')[1] || ''
    const urlSearchParams = new URLSearchParams(queryString)
    return parseUrlParamsObject(Object.fromEntries(urlSearchParams))
}

/** --- fireGetAndForget() --------------------------------------------------------------------- */
/** -i- Fires a GET request & ignores whether it succeeds or not (for e.g. webhooks)
 ** https://stackoverflow.com/a/63594903/8789673 */
export const fireGetAndForget = (url: string, config?: RequestInit) => {
    try {
        // Fire request
        fetch(url, config).catch(Boolean);
        // Resolve without waiting for response
        return true;
    } catch (err) {
        // Do nothing to avoid unhandled promise rejections
    }
};
  
/** --- firePostAndForget() -------------------------------------------------------------------- */
/** -i- Fires a POST request & ignores whether it succeeds or not (for e.g. webhooks)
 ** https://stackoverflow.com/a/63594903/8789673 */
export const firePostAndForget = (url: string, data: unknown, config?: RequestInit) => {
    try {
        // Fire request
        fetch(url, {
            method: 'POST',
            body: JSON.stringify(data),
            ...config
        }).catch(Boolean);
        // Resolve without waiting for response
        return true;
    } catch (err) {
        // Do nothing to avoid unhandled promise rejections
    }
}
  
/** --- createHmac() --------------------------------------------------------------------------- */
/** -i- Create a cryptographical signature based on the data your pass and the chosen alogrithm */
export const createHmac = (data: string, method: 'md5' | 'sha256' = 'sha256'): string => {
    if (method === 'md5') return CryptoJS.HmacSHA256(data, method).toString(CryptoJS.enc.Hex)
    return CryptoJS.HmacSHA256(data, method).toString(CryptoJS.enc.Hex)
}

/** --- encrypt() ------------------------------------------------------------------------------ */
/** -i- Encrypts a piece of data with a custom secret or the APP_SECRET */
export const encrypt = (data: string, secret = process.env.APP_SECRET) => {
    if (!secret) throw new Error('Custom or APP_SECRET is required to encrypt data')
    return CryptoJS.AES.encrypt(data, secret).toString()
}

/** --- decrypt() ------------------------------------------------------------------------------ */
/** -i- Decrypts a piece of data with a custom secret or the APP_SECRET */
export const decrypt = (data: string, secret = process.env.APP_SECRET) => {
    if (!secret) throw new Error('Custom or APP_SECRET is required to decrypt data')
    const bytes = CryptoJS.AES.decrypt(data, secret)
    return bytes.toString(CryptoJS.enc.Utf8)
}

/** --- createMiddlewareContext() -------------------------------------------------------- */
/** -i- Use to add serialisable context data to your request header so you can use it in resolvers (signed based on APP_SECRET) */
export const createMiddlewareContext = async (
    req: NextRequest,
    data: Record<string, unknown> = {},
    extraHeaders: Record<string, string> = {}
  ) => {
    // Warn and abort early when we won't be able to add and sign the data
    const APP_SECRET = process.env.APP_SECRET
    if (!APP_SECRET) warnOnce('APP_SECRET variable is required to create header context, skipping context generation until it is set') // prettier-ignore
    if (!req?.headers) throw new Error('Request headers are required to create header context, skipping context generation until they are available') // prettier-ignore
    // Set all extra headers first
    const requestHeaders = new Headers(req.headers)
    Object.keys(extraHeaders).forEach((key) => {
        requestHeaders.set(key, extraHeaders[key])
    })
    // Serialise context data and add signature?
    const shouldAddData = !!APP_SECRET && !isEmpty(data)
    if (shouldAddData) {
        const serialisedData = JSON.stringify(data)
        const signableString = `${serialisedData}:${APP_SECRET}`
        const signature = createHmac(signableString, 'md5')
        const dataWithSignature = { ...data, signature }
        const signedHeaderContext = JSON.stringify(dataWithSignature)
        requestHeaders.set('context', signedHeaderContext)
    }
    // Return updated headers
    return requestHeaders
}
  
/** --- getHeaderContext() --------------------------------------------------------------------- */
/** -i- Use in resolvers to extract header context */
export const getHeaderContext = (
    req?: NextApiRequest | Request | GetServerSidePropsContext['req']
): Record<string, unknown> => {
    try {
        // Check if there even is context in the headers to begin with
        const requestContext = (req as Request)?.headers?.get?.('context')
        const apiRequestContext = (req as NextApiRequest)?.headers?.context // @ts-ignore
        const gqlRequestContext = (req?.req as Request)?.headers?.get?.('context')
        const headerContextRaw = requestContext || apiRequestContext || gqlRequestContext
        if (!headerContextRaw) return {}
        // Parse context
        const headerContextJSON = Array.isArray(headerContextRaw) ? headerContextRaw[0] : headerContextRaw // prettier-ignore
        const headerContext = JSON.parse(headerContextJSON)
        if (isEmpty(headerContext)) return {}
        // Skip if there is no APP_SECRET
        const APP_SECRET = process.env.APP_SECRET
        if (!APP_SECRET) return headerContext
        // Check if the signature is valid
        const { signature, ...contextData } = headerContext
        const serialisedData = JSON.stringify(contextData)
        const signableString = `${serialisedData}:${APP_SECRET}`
        const expectedSignature = createHmac(signableString, 'md5')
        if (signature !== expectedSignature) return {}
        // Return validated context
        return contextData
    } catch (err) {
        console.error(err)
        return {}
    }
}
