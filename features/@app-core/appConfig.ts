import Constants from 'expo-constants'
import { Platform, Dimensions } from 'react-native'
import { DRIVER_OPTIONS, createDriverConfig } from '@app/registries/drivers.config'

/* --- Notes ----------------------------------------------------------------------------------- */

// -i- Workspace package '@green-stack/core' expects this file to be at '/features/app-core/appConfig.ts'
// -i- Please keep it here to avoid issues

// -i- Avoid exposing secrets by only using `EXPO_PUBLIC_` or `NEXT_PUBLIC_` prefixes for public variables.
// -i- Env vars without prefixes are considered secrets and are not exposed to the clients.

/* --- Env Flags ------------------------------------------------------------------------------- */

export const isProd = process.env.NODE_ENV === 'production'
export const isDev = process.env.NODE_ENV === 'development'

export const isWeb = Platform.OS === 'web'
export const isAndroid = Platform.OS === 'android'
export const isIOS = Platform.OS === 'ios'
export const isMobile = isAndroid || isIOS
export const isServer = isWeb && typeof window === 'undefined'

export const isExpoGo = Constants?.appOwnership === 'expo' || !!Constants?.expoVersion

export const isDocs = process.env.NEXT_PUBLIC_APP_ENV === 'docs'
export const isExpo = isExpoGo || process.env.EXPO_PUBLIC_APP_ENV === 'expo'
export const isNext = (!isExpo && isWeb) || process.env.NEXT_PUBLIC_APP_ENV === 'next' || isDocs

export const isWebLocalServer = isWeb && isServer && process.env.PORT === '3000'
export const isWebLocalhost = isWeb && (globalThis?.location?.hostname === 'localhost' || isWebLocalServer)
export const isExpoWebLocal = isWebLocalhost && globalThis?.location?.port === '8081'
export const isNextLocal = isNext && isWebLocalhost && !isExpoWebLocal

/* --- Computed Fallbacks ---------------------------------------------------------------------- */

export const fallbackExpoWebHost = isExpoWebLocal ? 'localhost' : ''

export const expoDebuggerHost = Constants?.expoGoConfig?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost // prettier-ignore
export const localURL = expoDebuggerHost?.split?.(':').shift() || fallbackExpoWebHost

export const fallbackBaseURL = localURL ? `http://${localURL}:3000` : ''

/* --- Endpoints ------------------------------------------------------------------------------- */

export const baseURL = process.env.NEXT_PUBLIC_BASE_URL || process.env.EXPO_PUBLIC_BASE_URL || `${fallbackBaseURL}` // prettier-ignore
export const backendURL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL || `${fallbackBaseURL}` // prettier-ignore
export const apiURL = process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || `${fallbackBaseURL}/api` // prettier-ignore
export const graphURL = process.env.NEXT_PUBLIC_GRAPH_URL || process.env.EXPO_PUBLIC_GRAPH_URL || `${fallbackBaseURL}/api/graphql` // prettier-ignore

/* --- Locality -------------------------------------------------------------------------------- */

export const isExpoMobileLocal = !!expoDebuggerHost
export const isExpoLocal = isExpoWebLocal || isExpoMobileLocal

export const isLocal = isWebLocalhost || isExpoLocal || isNextLocal || backendURL?.includes('localhost')

/* --- Sizes ----------------------------------------------------------------------------------- */

export const isMobileSize = isServer ? undefined : Dimensions.get('window').width < 768

/** --- appConfig ------------------------------------------------------------------------------ */
/** -i- App config variables powered by env vars universally, and including some expo contants config on mobile */
export const appConfig = {

    // --- Flags ---

    isProd,
    isDev,
    isWeb,
    isMobile,
    isAndroid,
    isIOS,
    isServer,
    isExpo,
    isNext,
    isDocs,
    isLocal,
    isWebLocalhost,
    isNextLocal,
    isExpoGo,
    isExpoWebLocal,
    isExpoMobileLocal,
    isMobileSize,

    // --- Server URLs ---

    baseURL,
    backendURL,
    apiURL,
    graphURL,

    // --- Secrets ---

    // -!- Don't use NEXT_PUBLIC_ / EXPO_PUBLIC_ prefixes here to make sure these are undefined client-side
    appSecret: process.env.APP_SECRET,

    // --- Drivers ---

    drivers: createDriverConfig({
        db: DRIVER_OPTIONS.db.mockDB,
    }),

    // --- Web Default Metadata ---

    // -i- Can be overwritten on each route using Next.js metadata exports (RSC only, so no "use client" routes)
    // -i- https://nextjs.org/docs/app/building-your-application/optimizing/metadata

    title: 'My Universal App',
    description: 'TODO: Add description',
    openGraph: {
        title: 'My Universal App',
        description: 'TODO: Add description',
        url: baseURL,
        siteName: 'TODO: Set your site name',
    },

    // --- Mobile Metadata ---

    appName: Constants?.manifest2?.name || Constants?.manifest?.name,
    appVersion: Constants?.manifest2?.version || Constants?.manifest?.version,
    appDescription: Constants?.manifest2?.description || Constants?.manifest?.description,
    appIcon: Constants?.manifest2?.icon || Constants?.manifest?.icon,
    appSlug: Constants?.manifest2?.slug || Constants?.manifest?.slug,
    appScheme: Constants?.manifest2?.scheme || Constants?.manifest?.scheme,
    appHostUri: Constants?.expoConfig?.hostUri,

    // --- Constants ---

    debugMode: Constants?.debugMode,
    
} as const

/* --- Debug ----------------------------------------------------------------------------------- */

if (Platform.OS !== 'web' && appConfig.baseURL === '') {
    console.warn('appConfig.baseURL is empty, you may be missing some environment variables')
}
