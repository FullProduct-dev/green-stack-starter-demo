// @ts-ignore
import { expect, test } from 'bun:test'
import { graphql } from 'gql.tada'
import { ASTNode, print } from 'graphql'
import { z, schema, type SchemaInput, type SchemaOutput } from '../v3'
import { createDataBridge } from '../createDataBridge'
import { bridgedFetcher } from '../bridgedFetcher'

/* --- Test Resources -------------------------------------------------------------------------- */

const healtCheckBridge = createDataBridge({
    resolverName: 'healthCheck',
    inputSchema: schema('HealthCheck', { echo: z.string().default('Hello World') }),
    outputSchema: schema('HealthCheckOutput', { echo: z.string().optional() }),
    apiPath: '/api/health',
    allowedMethods: ['GET', 'GRAPHQL'],
})

type healtCheckBridge = typeof healtCheckBridge
type healtCheckBridgeInput = SchemaInput<healtCheckBridge['inputSchema']>
type healtCheckBridgeOutput = SchemaOutput<healtCheckBridge['outputSchema']>

// -i- When it's an input, we append 'Input' to the name if it doesn't already have it or 'Args'
const expectedQuery = `query healthCheck($healthCheckArgs: HealthCheckInput!) {
  healthCheck(args: $healthCheckArgs) {
    echo
  }
}`

/* --- Tests ----------------------------------------------------------------------------------- */

test("Bridges created by createDataBridge infer the right argsName & query type (z3)", () => {
    expect(healtCheckBridge.resolverName).toBe('healthCheck')
    expect(healtCheckBridge.resolverArgsName).toBe('healthCheckArgs')
    expect(healtCheckBridge.resolverType).toBe('query')
})

test("Bridges created by createDataBridge can build the graphql query from args & response schemas (z3)", () => {
    const graphqlQuery = healtCheckBridge.getGraphqlQuery()
    expect(print(graphqlQuery as ASTNode)).toBe(expectedQuery)
})

test("Bridges created by createDataBridge can use a custom graphql query (z3)", () => {
    // -i- Build a custom graphql query (makes the args optional)
    const customHealthCheckQuery = graphql(`
        query healthCheck($healthCheckArgs: HealthCheckInput) {
            healthCheck(args: $healthCheckArgs) {
                echo
            }
        }
    `)
    const bridgeWithCustomQuery = createDataBridge({
        ...healtCheckBridge,
        graphqlQuery: customHealthCheckQuery,
    })
    const graphqlQuery = bridgeWithCustomQuery.getGraphqlQuery()
    expect(print(graphqlQuery as ASTNode)).not.toBe(expectedQuery)
})

test("bridgedFetcher() can create a fetcher function from a DataBridge (z3)", async () => {
    expect(() => bridgedFetcher(healtCheckBridge)).not.toThrow()
    const fetcher = bridgedFetcher(healtCheckBridge)
    expect(fetcher).toBeInstanceOf(Function)
})
