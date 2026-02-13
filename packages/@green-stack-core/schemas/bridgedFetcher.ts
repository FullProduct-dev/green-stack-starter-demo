import type { TadaDocumentNode, VariablesOf, ResultOf } from 'gql.tada'
import type { QueryConfig } from '@app/core/graphql/graphqlQuery.types'

/** -i- Lazy-loaded to avoid pulling in auth (and react-native) in Node/Bun test environments */
const loadGraphqlQuery = () => import('@app/core/graphql/graphqlQuery').then((m) => m.graphqlQuery)

/** --- bridgedFetcher() ----------------------------------------------------------------------- */
/** -i- Helper to create a typed fetcher from config created by `createDataBridge()` */
export const bridgedFetcher = <
    ResolverName extends string,
    BridgeQuery extends TadaDocumentNode | unknown,
    CustomQuery extends TadaDocumentNode | null = null,
    FinalQuery extends TadaDocumentNode | unknown = CustomQuery extends null ? BridgeQuery : CustomQuery,
>({
    allowedMethods,
    getGraphqlQuery,
    graphqlQuery: customQuery,
}: {
    resolverName: ResolverName
    getGraphqlQuery: () => BridgeQuery
    graphqlQuery?: CustomQuery
    allowedMethods?: ('GRAPHQL' | 'GET' | 'POST' | 'PUT' | 'DELETE')[]
    [key: string]: any
}) => {
    // Log errors if the bridge is incompatible
    const hasGraphqlQuery = !!customQuery || !!getGraphqlQuery
    if (!allowedMethods?.includes('GRAPHQL') || !hasGraphqlQuery) {
        throw new Error('bridgedFetcher() with incompatible bridge. Please add "GRAPHQL" to the allowedMethods array in the DataBridge.')
    }

    // If a custom query is provided, use that instead
    if (customQuery) {
        // return customQuery as FinalQuery
        const query = customQuery as unknown as Exclude<FinalQuery, unknown>
        const fetcher = (async (
            variables: VariablesOf<Exclude<FinalQuery, unknown>>,
            config?: QueryConfig<TadaDocumentNode>,
        ) => {
            const graphqlQuery = await loadGraphqlQuery()
            try {
                const result = await graphqlQuery(query, { ...config, variables })
                return result
            } catch (error) {
                console.error('bridgedFetcher() error:', { error })
                throw error
            }
        }) as (
            variables: VariablesOf<FinalQuery>,
            config?: QueryConfig<TadaDocumentNode>,
        ) => Promise<ResultOf<FinalQuery>>
        return Object.assign(fetcher, { isUniversalQuery: true }) as typeof fetcher & { isUniversalQuery: true }
    }

    // Otherwise, use the query from the bridge
    const query = getGraphqlQuery() as unknown as Exclude<FinalQuery, unknown>
    const fetcher = (async (
        variables: VariablesOf<Exclude<FinalQuery, unknown>>,
        config?: QueryConfig<TadaDocumentNode>,
    ) => {
        const graphqlQuery = await loadGraphqlQuery()
        try {
            const result = await graphqlQuery(query, { ...config, variables })
            return result as ResultOf<FinalQuery>
        } catch (error) {
            console.error('bridgedFetcher() error:', { error })
            throw error
        }
    }) as ((
        variables: VariablesOf<FinalQuery>,
        config?: QueryConfig<TadaDocumentNode>,
    ) => Promise<ResultOf<FinalQuery>>)
    return Object.assign(fetcher, { isUniversalQuery: true }) as typeof fetcher & { isUniversalQuery: true }
}
