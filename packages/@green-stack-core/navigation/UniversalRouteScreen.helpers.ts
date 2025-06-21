"use client"
import { QueryConfig } from '@app/core/graphql/graphqlQuery.types'
import type { TadaDocumentNode } from 'gql.tada'
import type { QueryKey } from '@tanstack/react-query'

/* --- Types ----------------------------------------------------------------------------------- */

export type QueryFn<
    ARGS extends Record<string, unknown> = Record<string, unknown>,
    RES extends Record<string, unknown> = Record<string, unknown>
> = (
    args: ARGS,
    context?: QueryConfig<TadaDocumentNode>
) => Promise<RES>

// @ts-ignore
export type QueryBridgeConfig<
    ARGS extends Record<string, unknown> = Record<string, unknown>,
    RES extends Record<string, unknown> = Record<string, unknown>,
    Fetcher = QueryFn<ARGS, RES>,
    FetcherArgs = Parameters<QueryFn<ARGS, RES>>[0],
    FetcherToProps extends (data: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => unknown = (data: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => Awaited<ReturnType<QueryFn<ARGS, RES>>>,
    ParamsToQueryKey extends (routeParams: ExtractRouteParams<FetcherArgs>) => QueryKey = (routeParams: ExtractRouteParams<FetcherArgs>) => QueryKey,
    ParamsToQueryInput extends (routeParams: ExtractRouteParams<FetcherArgs>) => FetcherArgs = (routeParams: ExtractRouteParams<FetcherArgs>) => FetcherArgs
> = {
    /** -i- Function to turn any route params into the query key for the `routeDataFetcher()` query */
    routeParamsToQueryKey: ParamsToQueryKey
    /** -i- Function to turn any route params into the input args for the `routeDataFetcher()` query */
    routeParamsToQueryInput: ParamsToQueryInput
    /** -i- Fetcher to prefetch data for the Page and QueryClient during SSR, or fetch it clientside if browser / mobile */
    routeDataFetcher: Fetcher & { isUniversalQuery?: boolean }
    /** -i- Function transform fetcher data into props */
    fetcherDataToProps?: FetcherToProps
    /** -i- Initial data provided to the QueryClient */
    initialData?: ReturnType<QueryFn<ARGS, RES>>
}

// @ts-ignore
export type UniversalRouteProps<
    ARGS extends Record<string, unknown> = Record<string, unknown>,
    RES extends Record<string, unknown> = Record<string, unknown>,
    FetcherArgs = Parameters<QueryFn<ARGS, RES>>[0],
    FetcherToProps extends (data: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => unknown = (data: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => Awaited<ReturnType<QueryFn<ARGS, RES>>>,
    ParamsToQueryKey extends (routeParams: ExtractRouteParams<FetcherArgs>) => QueryKey = (routeParams: ExtractRouteParams<FetcherArgs>) => QueryKey,
    ParamsToQueryInput extends (routeParams: ExtractRouteParams<FetcherArgs>) => FetcherArgs = (routeParams: ExtractRouteParams<FetcherArgs>) => FetcherArgs
> = {
    /** -i- Optional params passed by the Next.js app router, in Expo we get these from `useRouteParams()` */
    params?: Partial<ARGS>
    /** -i- Optional search params passed by the Next.js app router, in Expo we get these from `useRouteParams()` */
    searchParams?: Partial<ARGS>
    /** -i- Configuration for the query bridge */
    queryBridge: QueryBridgeConfig<ARGS, RES, QueryFn<ARGS, RES>, FetcherArgs, FetcherToProps, ParamsToQueryKey, ParamsToQueryInput>
    /** -i- The screen to render for this route */
    routeScreen: React.ComponentType
}

export type HydratedRouteProps<
    QueryBridge extends {
        fetcherDataToProps: (fetcherData: any) => any,
        routeDataFetcher: (...args: any[]) => Promise<any>,
        routeParamsToQueryKey: any,
        routeParamsToQueryInput: any
        initialData?: any
    } = {
        fetcherDataToProps: (fetcherData: any$Unknown) => Record<string, any$Unknown>,
        routeDataFetcher: (...args: any[]) => Promise<any>,
        routeParamsToQueryKey: any,
        routeParamsToQueryInput: any
        initialData?: any
    }
> = Prettify<ReturnType<Exclude<QueryBridge['fetcherDataToProps'], undefined>> & {
    /** -i- The route key for the query */
    queryKey: QueryKey
    /** -i- The input args for the query */
    queryInput: Parameters<QueryBridge['routeDataFetcher']>[0]
    /** -i- The route params passed by the Next.js app router, in Expo we get these from `useRouteParams()` */
    params: Partial<Parameters<QueryBridge['routeDataFetcher']>[0]>
    /** -i- The search params passed by the Next.js app router, in Expo we get these from `useRouteParams()` */
    searchParams: Partial<Parameters<QueryBridge['routeDataFetcher']>[0]>
    /** -i- Refetch the initial data */
    refetchInitialData?: () => Promise<{ data: ReturnType<Exclude<QueryBridge['fetcherDataToProps'], undefined>> }>
}>

/** --- createQueryBridge() -------------------------------------------------------------------- */
/** -i- Util to create a typed bridge between a fetcher and a route's props */ // @ts-ignore
export const createQueryBridge = <
    ARGS extends Record<string, unknown> = Record<string, unknown>,
    RES extends Record<string, unknown> = Record<string, unknown>,
    FetcherArgs = Parameters<QueryFn<ARGS, RES>>[0], // @ts-ignore
    FetcherData = Awaited<ReturnType<QueryBridgeConfig<ARGS, RES, QueryFn<ARGS, RES>>['routeDataFetcher']>>,
    FetcherToProps extends (fetcherData: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => unknown = (fetcherData: Awaited<ReturnType<QueryFn<ARGS, RES>>>) => Awaited<ReturnType<QueryFn<ARGS, RES>>>,
    ParamsToQueryKey extends (routeParams: ExtractRouteParams<FetcherArgs>) => QueryKey = (routeParams: ExtractRouteParams<FetcherArgs>) => QueryKey,
    ParamsToQueryInput extends (routeParams: ExtractRouteParams<FetcherArgs>) => FetcherArgs = (routeParams: ExtractRouteParams<FetcherArgs>) => FetcherArgs
>(
    queryBridge: QueryBridgeConfig<ARGS, RES, QueryFn<ARGS, RES>, FetcherArgs, FetcherToProps, ParamsToQueryKey, ParamsToQueryInput>
) => {
    const fetcherDataToProps = queryBridge.fetcherDataToProps || ((fetcherData: FetcherData) => fetcherData)
    return {
        ...queryBridge,
        fetcherDataToProps: fetcherDataToProps as FetcherToProps,
        ARGS: undefined as unknown as ARGS,
        RES: undefined as unknown as RES,
        FetcherArgs: undefined as unknown as FetcherArgs,
        RouteParams: undefined as unknown as ExtractRouteParams<FetcherArgs>,
    }
}

/* --- Defaults -------------------------------------------------------------------------------- */

export const DEFAULT_QUERY_BRIDGE = {
    routeParamsToQueryKey: (routeParams: Record<string, unknown>) => [JSON.stringify(routeParams)],
    routeParamsToQueryInput: (routeParams: Record<string, unknown>) => routeParams,
    routeDataFetcher: Object.assign(async () => ({}), { isUniversalQuery: true }),
    initialData: {},
} as unknown as QueryBridgeConfig<
    Record<string, any$Unknown>,
    Record<string, any$Unknown>,
    QueryFn<Record<string, any$Unknown>, Record<string, any$Unknown>>,
    Record<string, any$Unknown>,
    (data: Record<string, any$Unknown>) => Record<string, any$Unknown>,
    (routeParams: Record<string, any$Unknown>) => QueryKey,
    (routeParams: Record<string, any$Unknown>) => Record<string, any$Unknown>
>
