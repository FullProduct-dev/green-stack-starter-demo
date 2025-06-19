import { useQuery } from '@tanstack/react-query'
import { UniversalRouteProps, QueryFn, DEFAULT_QUERY_BRIDGE } from './UniversalRouteScreen.helpers'
import { useRouteParams } from './useRouteParams'

/** --- <UniversalRouteScreen/> -------------------------------------------------------------------- */
/** -i- Universal Route Wrapper to provide query data on mobile, the browser and during server rendering */
export const UniversalRouteScreen = <
    ARGS extends Record<string, unknown> = Record<string, unknown>,
    RES extends Record<string, unknown> = Record<string, unknown>,
>(props: UniversalRouteProps<ARGS, RES>) => {
    
    // Props
    const { params: routeParams, searchParams, routeScreen: RouteScreen, queryBridge = DEFAULT_QUERY_BRIDGE, ...screenProps } = props
    const { routeParamsToQueryKey, routeParamsToQueryInput, routeDataFetcher } = queryBridge
    const fetcherDataToProps = queryBridge.fetcherDataToProps || ((data: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => data)

    // Hooks
    const expoRouterParams = useRouteParams(props)

    // Vars
    const queryParams = { ...routeParams, ...searchParams, ...expoRouterParams } as ARGS // @ts-ignore
    const queryKey = routeParamsToQueryKey(queryParams as any)
    const queryInput = routeParamsToQueryInput(queryParams as any)

    // -- Query --

    const queryConfig = {
        queryKey,
        queryFn: async () => await routeDataFetcher(queryInput as ARGS),
        initialData: queryBridge.initialData as Awaited<RES>,
    }

    // -- Mobile --
    
    const { data: fetcherData, ...query } = useQuery(queryConfig)
    const routeDataProps = fetcherDataToProps(fetcherData as Awaited<RES>) as Record<string, unknown>
    
    const refetchInitialData = async () => {
        const queryState = await query.refetch()
        const regeneratedProps = fetcherDataToProps(queryState.data as any) as Record<string, unknown>
        return regeneratedProps
    }

    return (
        <RouteScreen
            {...routeDataProps}
            queryKey={queryKey}
            queryInput={queryInput}
            refetchInitialData={refetchInitialData}
            {...screenProps} // @ts-ignore
            params={routeParams}
            searchParams={searchParams}
        />
    )
}
