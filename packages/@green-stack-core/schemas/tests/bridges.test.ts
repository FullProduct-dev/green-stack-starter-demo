// @ts-ignore
import { expect, test } from 'bun:test'
import { ASTNode, print } from 'graphql'
import { z, schema } from '../index'
import { createDataBridge } from '../createDataBridge'
import { bridgedFetcher } from '../bridgedFetcher'

const healtCheckBridge = createDataBridge({
    resolverName: 'healthCheck',
    inputSchema: schema('HealthCheck', { echo: z.string().default('Hello World') }),
    outputSchema: schema('HealthCheckOutput', { echo: z.string().optional() }),
    apiPath: '/api/health',
    allowedMethods: ['GET', 'GRAPHQL'],
})

// -i- When it's an input, we append 'Input' to the name if it doesn't already have it or 'Args'
const expectedQuery = `query healthCheck($healthCheckArgs: HealthCheckInput!) {
  healthCheck(args: $healthCheckArgs) {
    echo
  }
}`

test("Bridges created by createDataBridge infer the right argsName & query type", () => {
    expect(healtCheckBridge.resolverName).toBe('healthCheck')
    expect(healtCheckBridge.resolverArgsName).toBe('healthCheckArgs')
    expect(healtCheckBridge.resolverType).toBe('query')
})

test("Bridges created by createDataBridge can build the graphql query from args & response schemas", () => {
    const graphqlQuery = healtCheckBridge.getGraphqlQuery()
    expect(print(graphqlQuery as ASTNode)).toBe(expectedQuery)
})

test("Bridges created by createDataBridge can use a custom graphql query", async () => {
    // Lazily import the query to avoid circular dependencies
    const { healthCheckQuery } = await (import('@app/core/resolvers/healthCheck.query'))
    const bridgeWithCustomQuery = createDataBridge({
        ...healtCheckBridge,
        graphqlQuery: healthCheckQuery,
    })
    const graphqlQuery = bridgeWithCustomQuery.getGraphqlQuery()
    expect(print(graphqlQuery as ASTNode)).not.toBe(expectedQuery)
})

test("bridgedFetcher() can create a fetcher function from a DataBridge", async () => {
    expect(() => bridgedFetcher(healtCheckBridge)).not.toThrow()
    const fetcher = bridgedFetcher(healtCheckBridge)
    expect(fetcher).toBeInstanceOf(Function)
})
