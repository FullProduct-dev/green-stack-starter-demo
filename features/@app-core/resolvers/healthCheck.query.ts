import { ResultOf, VariablesOf } from 'gql.tada'
import { bridgedFetcher } from '@green-stack/schemas/bridgedFetcher'
import { healthCheckBridge } from './healthCheck.bridge'
import { graphql } from '@app/core/graphql/graphql'
import { useQuery, UseQueryOptions, QueryKey } from '@tanstack/react-query'

/* --- Query ----------------------------------------------------------------------------------- */

export const healthCheckQuery = graphql(`
    query healthCheck ($healthCheckArgs: HealthCheckInput) {
        healthCheck(args: $healthCheckArgs) {
            echo
            status
            alive
            kicking
            now
            aliveTime
            aliveSince
            serverTimezone
            requestHost
            requestProtocol
            requestURL
            baseURL
            backendURL
            apiURL
            graphURL
            port
            debugPort
            nodeVersion
            v8Version
            systemArch
            systemPlatform
            systemRelease
            systemFreeMemory
            systemTotalMemory
            systemLoadAverage
            context
        }
    }
`)

/* --- Types ----------------------------------------------------------------------------------- */

export type HealthCheckQueryInput = VariablesOf<typeof healthCheckQuery>

export type HealthCheckQueryOutput = ResultOf<typeof healthCheckQuery>

/* --- healthCheckFetcher() -------------------------------------------------------------------- */

export const healthCheckFetcher = bridgedFetcher({
    ...healthCheckBridge,
    graphqlQuery: healthCheckQuery,
})

/** --- useHealthCheckQuery() ------------------------------------------------------------- */
/** -i- React Query hook to update the organisation's plan name, linked github org and slug */
export const useHealthCheckQuery = (
    input: HealthCheckQueryInput,
    options: Omit<UseQueryOptions<HealthCheckQueryOutput>, 'queryKey' | 'queryFn'> & {
        queryKey?: QueryKey,
    }
) => {
    return useQuery({
        queryKey: ['healthCheck', input],
        queryFn: () => healthCheckFetcher(input),
        ...options,
    })
}
