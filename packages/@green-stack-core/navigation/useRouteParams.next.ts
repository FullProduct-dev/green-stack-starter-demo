import { useSyncExternalStore } from 'react'
import type { useLocalSearchParams } from 'expo-router'
import type { UniversalRouteScreenProps, UseRouteParamsOptions } from './useRouteParams.types'
import { parseUrlParamsObject } from '../utils/objectUtils'
import { extractParams } from './useRouteParams.helpers'
import { subscribeToSearchParams, getSearchParamsSnapshot, getServerSearchParamsSnapshot } from './searchParamsStore'

/** --- useRouteParams() ----------------------------------------------------------------------- */
/** -i- Gets the route search and query params on both web and mobile.
 ** -i- When `reactive` is true (default), also subscribes to shallow URL changes. */
export const useRouteParams = (
    routeScreenProps: UniversalRouteScreenProps,
    options?: UseRouteParamsOptions,
) => {

    // Options
    const { reactive = true } = options ?? {}

    // Router Params
    const params = extractParams(routeScreenProps.params)
    const searchParams = extractParams(routeScreenProps.searchParams)

    // Subscribe to shallow search param changes when reactive
    const currentSearch = reactive ? useSyncExternalStore(subscribeToSearchParams, getSearchParamsSnapshot, getServerSearchParamsSnapshot) : null

    // When reactive, parse live URL params and merge with static props
    const liveSearchParams = currentSearch ? Object.fromEntries(new URLSearchParams(currentSearch).entries()) : {}

    return parseUrlParamsObject({
        ...params,
        ...searchParams,
        ...liveSearchParams,
    }) as ReturnType<typeof useLocalSearchParams>
}
