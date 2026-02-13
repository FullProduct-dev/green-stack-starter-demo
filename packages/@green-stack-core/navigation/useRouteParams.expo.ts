import { useLocalSearchParams } from 'expo-router'
import type { UniversalRouteScreenProps, UseRouteParamsOptions } from './useRouteParams.types'
import { parseUrlParamsObject } from '../utils/objectUtils'

/** --- useRouteParams() ----------------------------------------------------------------------- */
/** -i- Gets the route search and query params on both web and mobile.
 ** The `options` param is accepted for type compatibility but has no effect on Expo,
 ** as `useLocalSearchParams()` is already reactive. */
export const useRouteParams = (routeScreenProps: UniversalRouteScreenProps, _options?: UseRouteParamsOptions) => {
    const { params, searchParams } = routeScreenProps
    const expoRouterParams = useLocalSearchParams()
    return parseUrlParamsObject({
        ...params,
        ...searchParams,
        ...expoRouterParams,
    }) as typeof expoRouterParams
}
