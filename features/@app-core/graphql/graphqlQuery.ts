import { print } from 'graphql/language/printer'
import type { TadaDocumentNode, ResultOf } from 'gql.tada'
import type { QueryConfig } from './graphqlQuery.types'
import { appConfig } from '../appConfig'

/** --- graphqlQuery --------------------------------------------------------------------------- */
/** -i- Isomorphic graphql request, uses the graphql endpoint in browser & mobile, but the executable schema serverside */
export const graphqlQuery = Object.assign(async <T extends TadaDocumentNode, R = ResultOf<T>>(query: T, config?: QueryConfig<T>) => {
    
    // Config
    const { variables, headers, graphqlEndpoint } = config || {}

    // Vars
    const queryString = print(query)

    // -- Native: Execute query with fetch --

    try {
        const { graphURL } = appConfig
        const fetchURL = graphqlEndpoint || graphURL
        const res = await fetch(fetchURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify({ query: queryString, variables }),
        })
        const { data, errors } = await res.json()
        if (errors) throw new Error(errors[0].message)
        return data as R
    } catch (error: any) {
        throw new Error(error)
    }
}, {
    // -i- Flag to help detect whether it's safe to pass extra context to this fetcher function
    isUniversalQuery: true,
})
