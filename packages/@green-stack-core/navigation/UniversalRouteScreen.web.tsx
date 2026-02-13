"use client"
import { useState, useEffect, useContext } from 'react'
import { useQuery, HydrationBoundary } from '@tanstack/react-query'
import { UniversalRouteProps, QueryFn, DEFAULT_QUERY_BRIDGE } from './UniversalRouteScreen.helpers'
import { useRouteParams } from './useRouteParams'
import { extractParams } from './useRouteParams.helpers'
import { isExpoWebLocal } from '../../../features/@app-core/appConfig'
import { CoreContext } from '../context/CoreContext'
import { isEmpty } from '../utils/commonUtils'
import { ServerRouteScreen } from './ServerRouteScreen'

/* --- Helpers --------------------------------------------------------------------------------- */

const getSSRData = () => {
    const $ssrData = document.getElementById('ssr-data')
    const ssrDataText = $ssrData?.getAttribute('data-ssr')
    const ssrData = ssrDataText ? (JSON.parse(ssrDataText) as Record<string, any>) : null
    return ssrData
}

const getDehydratedSSRState = () => {
    const $ssrHydrationState = document.getElementById('ssr-hydration-state')
    const ssrHydrationStateText = $ssrHydrationState?.getAttribute('data-ssr')
    const ssrHydrationState = ssrHydrationStateText ? (JSON.parse(ssrHydrationStateText) as Record<string, any>) : null
    return ssrHydrationState
}

/** --- <UniversalRouteScreen/> ---------------------------------------------------------------- */
/** -i- Universal Route Wrapper to provide query data on mobile, the browser and during server rendering */
export const UniversalRouteScreen = <
    ARGS extends Record<string, unknown> = Record<string, unknown>,
    RES extends Record<string, unknown> = Record<string, unknown>,
>(props: UniversalRouteProps<ARGS, RES>) => {
    // Props
    const {
        queryBridge = DEFAULT_QUERY_BRIDGE,
        routeScreen: RouteScreen,
        params: nextParams,
        searchParams: nextSearchParams,
        ...screenProps
    } = props
    const { routeParamsToQueryKey, routeParamsToQueryInput, routeDataFetcher } = queryBridge
    const fetcherDataToProps = queryBridge.fetcherDataToProps || ((data: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => data)
    const routeParams = extractParams(nextParams)
    const searchParams = extractParams(nextSearchParams)

    // Disable reactive listening to avoid re-rendering the entire route tree on shallow param changes
    const nextRouterParams = useRouteParams(props, { reactive: false })

    // Context
    const { requestContext } = useContext(CoreContext)

    // State
    const [hydratedData, setHydratedData] = useState<Record<string, any> | null>(null)
    const [hydratedQueries, setHydratedQueries] = useState<Record<string, any> | null>(null)

    // Vars
    const isBrowser = typeof window !== 'undefined'
    const queryParams = { ...routeParams, ...searchParams, ...nextRouterParams } // @ts-ignore
    const queryKey = routeParamsToQueryKey(queryParams as unknown as ARGS)
    const queryInput = routeParamsToQueryInput(queryParams as any)

    // Flags
    const shouldAddContext = !isEmpty(requestContext) && !!routeDataFetcher?.isUniversalQuery && !isBrowser

    // -- Effects --

    useEffect(() => {
        const ssrData = getSSRData()
        if (ssrData) setHydratedData(ssrData) // Save the SSR data to state, removing the SSR data from the DOM
        const hydratedQueyClientState = getDehydratedSSRState()
        if (hydratedQueyClientState) setHydratedQueries(hydratedQueyClientState) // Save the hydrated state to state, removing the hydrated state from the DOM
    }, [])

    // -- Query --

    const queryConfig = {
        queryKey,
        queryFn: async () => {
            return await routeDataFetcher(
                queryInput as unknown as ARGS,
                shouldAddContext ? { requestContext } : {},
            )
        },
        initialData: queryBridge.initialData,
    }
    
    // -- Browser --

    if (isBrowser) {
        const hydrationData = hydratedData || getSSRData()
        const hydrationState = hydratedQueries || getDehydratedSSRState()
        const renderHydrationData = !!hydrationData && !hydratedData // Only render the hydration data if it's not already in state

        const hasInitialData = !!hydrationData || !!queryBridge.initialData
        const shouldRefetchOnMount = isExpoWebLocal || !hasInitialData

        const { data: fetcherData, ...query } = useQuery({
            ...queryConfig, // @ts-ignore
            initialData: shouldRefetchOnMount ? undefined : {
                ...queryConfig.initialData,
                ...hydrationData,
            },
            refetchOnMount: shouldRefetchOnMount,
        })
        const routeDataProps = fetcherDataToProps(fetcherData as any) as Record<string, unknown> // prettier-ignore
        
        const refetchInitialData = async () => {
            const queryState = await query.refetch()
            const regeneratedProps = fetcherDataToProps(queryState.data as any) as Record<string, unknown>
            return regeneratedProps
        }

        return (
            <HydrationBoundary state={hydrationState}>
                {renderHydrationData && <div id="ssr-data" data-ssr={JSON.stringify(fetcherData)} />}
                {renderHydrationData && <div id="ssr-hydration-state" data-ssr={JSON.stringify(hydrationState)} />}
                <RouteScreen
                    {...routeDataProps}
                    queryKey={queryKey}
                    queryInput={queryInput}
                    refetchInitialData={refetchInitialData}
                    {...screenProps} // @ts-ignore
                    params={routeParams}
                    searchParams={searchParams}
                />
            </HydrationBoundary>
        )
    }

    // -- Server --

    return (
        <ServerRouteScreen
            queryConfig={queryConfig}
            queryInput={queryInput}
            fetcherDataToProps={fetcherDataToProps}
            RouteScreen={RouteScreen}
            {...screenProps}
            routeParams={routeParams}
            searchParams={searchParams}
        />
    )
}
