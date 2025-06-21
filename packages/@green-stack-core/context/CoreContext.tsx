import React from 'react'
import { UniversalLinkProps } from '@green-stack/navigation/Link.types'
import { UniversalRouterMethods } from '@green-stack/navigation/useRouter.types'
import { UniversalRouteScreenProps } from '@green-stack/navigation/useRouteParams.types'
import type { useLocalSearchParams } from 'expo-router'
import type { UniversalImageMethods, UniversalImageProps } from '../components/Image.types'
import { KnownRoutes } from '@app/registries/routeManifest.generated'

/* --- Notes ----------------------------------------------------------------------------------- */

// -i- This context's only aim is to provide React Portability & Framework Ejection patterns if required
// -i- By allowing you to provide your own custom Link and Router overrides, you could e.g.:
// -i- 1) Support Expo for Web by not defaulting to Next.js's Link and Router on web
// -i- 2) Eject from Next.js entirely and e.g. use another framework's Image / Link / router

/* --- Types ----------------------------------------------------------------------------------- */

export type CoreContextType = {
    // Components
    contextImage:  ((props: UniversalImageProps) => JSX.Element) & UniversalImageMethods
    contextLink: <HREF extends KnownRoutes>(props: UniversalLinkProps<HREF>) => JSX.Element
    contextRouter: UniversalRouterMethods
    // Hooks
    useContextRouteParams: (routeScreenProps: UniversalRouteScreenProps) => ReturnType<typeof useLocalSearchParams>
    // Flags
    isExpo?: boolean
    isNext?: boolean
    isDebugMode?: boolean
    // Setters
    setIsDebugMode?: (isDebugMode: boolean) => void
    // Request Context
    requestContext?: Record<string, any$TooComplex>
}

/* --- Dummy ----------------------------------------------------------------------------------- */

const createDummyComponent = (contextComponentName: string) => () => {
    throw new Error(`CoreContext was not provided with a ${contextComponentName}. Please provide one in UniversalAppProviders.`)
}

/* --- Context --------------------------------------------------------------------------------- */

export const CoreContext = React.createContext<CoreContextType>({
    contextImage: createDummyComponent('contextImage') as any,
    contextLink: createDummyComponent('contextLink'),
    contextRouter: null as unknown as UniversalRouterMethods,
    useContextRouteParams: () => ({}),
    isExpo: undefined,
    isNext: undefined,
    isDebugMode: false,
})
