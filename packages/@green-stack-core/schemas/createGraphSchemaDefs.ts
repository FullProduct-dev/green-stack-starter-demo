import { gql } from 'graphql-tag'
import { Metadata, Meta$Schema, ZodSchema } from './index'
import { normalizeSchemaName } from './createDataBridge'
import { createSchemaPlugin } from './createSchemaPlugin'
import { isEmpty, warnOnce } from '../utils/commonUtils'

/* --- Constants ------------------------------------------------------------------------------- */

const SCHEMA_PRIMITIVES_LOOKUP = {
    Boolean: 'Boolean',
    Number: 'Float',
    Int: 'Int',
    Float: 'Float',
    String: 'String',
    Date: 'Date',
} as const

/* --- Types ----------------------------------------------------------------------------------- */

type ResolverFnType = ((...args: any[]) => Promise<unknown>) & {
    argSchema: ZodSchema,
    resSchema: ZodSchema,
    isMutation?: boolean
}

type ResolversMapType = {
    [key: string]: ResolverFnType
}

type ResolverConfig = {
    resolverName: string
    argSchema: ZodSchema,
    resSchema: ZodSchema,
    isMutation?: boolean
    resolver: ResolverFnType
}

/** --- createResolverDefinition() ------------------------------------------------------------- */
/** -i- Creates the base schema definition line to put on the Query or Mutation definition in the GraphQL schema */
export const createResolverDefinition = (resolverConfig: ResolverConfig) => {
    // Vars
    const { resolverName, argSchema, resSchema } = resolverConfig
    const argsMeta = argSchema?.introspect?.() as Meta$Schema
    const resMeta = resSchema?.introspect?.() as Meta$Schema
    // Flags
    const hasArgs = !isEmpty(argsMeta) && !isEmpty(argsMeta?.schema)
    const areArgsRequired = hasArgs && !argsMeta?.isNullable && !argsMeta?.isOptional
    const areArgsOptional = !areArgsRequired || Object.values(argsMeta?.schema!).every((arg) => arg.isOptional || arg.isNullable) // prettier-ignore
    const nullableToken = areArgsOptional ? '' : '!'
    // If there are args, we need to state an input type for them
    if (!argsMeta.name) console.log('argsMeta', argsMeta)
    const argsName = normalizeSchemaName(argsMeta.name!, 'input')
    const argDef = hasArgs ? `(args: ${argsName}${nullableToken})` : ''
    // Return resolver definition
    return `${resolverName}${argDef}: ${resMeta.name}`
}

/** --- createDataDefinition() ----------------------------------------------------------------- */
/** -i- Turns the introspection metadata of a resolver's input / output schema into GraphQL schema definitions */
export const createSchemaDefinition = (
    schema: Meta$Schema,
    prefix: 'type' | 'input' = 'type',
) => {
    // Keep track of all (possibly nested) schema definitions
    let schemaDefinitions: string[] = []
    // HoC Builder pattern to create schema definitions
    const schemaDefinitionBuilder = (graphqlType: string) => {
        return (schemaKey: string, fieldMeta: Meta$Schema | Metadata<any>) => {
            // Allow overrides of the graphql type to happen in specific cases (e.g. Float vs. Int)
            let gqlType = graphqlType

            // Skip sensitive fields on output types
            if (fieldMeta.isSensitive) return undefined

            // Determine nullability
            const isNullable = fieldMeta.isNullable || fieldMeta.isOptional
            const nullableToken = isNullable ? '' : '!'

            // Extract description - e.g. `"""This is a description"""`
            const { description } = fieldMeta
            const optionalDescription = description 
                ? `"""\n        ${description}\n        """\n        ` 
                : ''

            // Handle Int vs. Float - e.g. `someKey: Int!`
            if (fieldMeta.baseType === 'Number' && fieldMeta.isInt) gqlType = 'Int'

            // Handle ID - e.g. `someKey: ID!`
            if (fieldMeta.baseType === 'String' && fieldMeta.isID) gqlType = 'ID'
            
            // Handle nested schemas - e.g. `someKey: SomeData!`
            if (graphqlType === 'Schema' && fieldMeta.schema) {
                // Add the sub schemas to the list of definitions
                schemaDefinitions = [...schemaDefinitions, ...createSchemaDefinition(fieldMeta)]
                // Add the definition line for the schema itself
                if (!schema.name) console.log('schema', schema)
                const schemaName = normalizeSchemaName(fieldMeta?.name!, prefix)
                return `${optionalDescription}${schemaKey}: ${schemaName}${nullableToken}`
            }

            // Handle arrays - e.g. `someKey: [String]!`
            if (graphqlType === 'Array') {
                // Determine the array element type
                const primitiveElement = SCHEMA_PRIMITIVES_LOOKUP[fieldMeta.schema.baseType as keyof typeof SCHEMA_PRIMITIVES_LOOKUP] // prettier-ignore
                const arrayElementType = primitiveElement || normalizeSchemaName(fieldMeta.schema.name!, prefix) // prettier-ignore
                // If the array is a schema, we should add that schema's definitions as well
                if (!primitiveElement && fieldMeta.schema.schema) {
                    schemaDefinitions = [
                        ...schemaDefinitions,
                        ...createSchemaDefinition(fieldMeta.schema as unknown as Meta$Schema, prefix),
                    ]
                }
                // Add the definition line for the array element
                return `${optionalDescription}${schemaKey}: [${arrayElementType}]${nullableToken}` // prettier-ignore
            }

            // Handle primitives - e.g. `someKey: String`
            return `${optionalDescription}${schemaKey}: ${gqlType}${nullableToken}`
        }
    }

    // Map the introspection schema types to the GraphQL schema definition types
    const schemaMap = createSchemaPlugin(schema, {
        Boolean: schemaDefinitionBuilder('Boolean'),
        Number: schemaDefinitionBuilder('Float'),
        String: schemaDefinitionBuilder('String'),
        Date: schemaDefinitionBuilder('Date'),
        Array: schemaDefinitionBuilder('Array'),
        Object: schemaDefinitionBuilder('Schema'),
        Any: schemaDefinitionBuilder('JSON'),
        ZodRecord: schemaDefinitionBuilder('JSON'),
    })

    // Transform schema meta into graphql definitions - e.g. `type SomeType { someKey: String! }`
    const finalSchemaName = normalizeSchemaName(schema.name!, prefix)
    const fullSchemaDef = `
        ${prefix} ${finalSchemaName} {
            ${Object.values(schemaMap).filter(Boolean).join('\n        ')}
        }
    `
    
    // Remove excess spacing & newlines
    const finalSchemaDef = fullSchemaDef
        .split('\n    ')
        .join('\n')
        .replace('\n', '')
        .replace('}\n  ', '}')

    // Add the schema's own definition to the list
    if (!finalSchemaDef.includes('undefined')) {
        schemaDefinitions = [finalSchemaDef, ...schemaDefinitions]
    } else {
        warnOnce(`-!- Skipping schema definition for ${finalSchemaName} due to undefined fields`, {
            schema,
            prefix,
            schemaDefinitions,
        })
    }

    // Return results
    return schemaDefinitions
}

/** --- createDataDefinitions() ---------------------------------------------------------------- */
/** -i- Turns a list of resolvers created with `createResolver()` into GraphQL schema definitions */
export const createDataDefinitions = (resolverConfigs: ResolverConfig[]) => {
    // Use introspection metadata to create schema definitions of the input & output types
    const dataDefinitions = resolverConfigs.reduce((acc, { argSchema, resSchema }) => {
        let argDefinitions = createSchemaDefinition(argSchema.introspect() as Meta$Schema, 'input')
        let resDefinitions = createSchemaDefinition(resSchema.introspect() as Meta$Schema, 'type')
        // If there are no args, we don't need to define an input type
        const hasArgs = !isEmpty(argSchema.introspect().schema)
        if (!hasArgs) argDefinitions = []
        // If there's no output, we don't need to define an output type
        const hasRes = !isEmpty(resSchema.introspect().schema)
        if (!hasRes) resDefinitions = []
        // Return the data definitions
        return [...acc, ...argDefinitions, ...resDefinitions] as string[]
    }, [] as string[])
    // Flatten the resulting array of definitions (can contain duplicates)
    return dataDefinitions.flat()
}

/** --- createGraphSchemaDefs() ---------------------------------------------------------------- */
/** -i- Turn a dictionary object of resolvers created with `createResolver()` into GraphQL schema definitions  */
export const createGraphSchemaDefs = (resolvers: ResolversMapType) => {
    // Error checks
    if (isEmpty(resolvers)) {
        warnOnce('-i- No resolvers provided to createGraphSchemaDefs(), no schema definition to generate')
        return {
            queryResolvers: {},
            mutationResolvers: {},
            graphqlSchemaDefs: gql``,
            schemaDefsString: '',
        }
    }
    // Get resolver entries
    const resolverEntries = Object.entries(resolvers)
    const resolverConfigs = resolverEntries.map(([resolverName, resolver]) => ({
        resolverName,
        argSchema: resolver.argSchema,
        resSchema: resolver.resSchema,
        isMutation: !!resolver.isMutation,
        resolver,
    }))
    // Helper to rebuild the resolvers from their configs
    const rebuildFromConfig = (handlers: any, { resolverName, resolver }: ResolverConfig) => ({
        ...handlers, [resolverName]: resolver,
    })
    // Figure out the mutation definitions
    const mutationConfigs = resolverConfigs.filter((config) => !!config.isMutation)
    const mutationResolvers = mutationConfigs.reduce(rebuildFromConfig, {})
    const mutationDefs = mutationConfigs.map(createResolverDefinition).filter(Boolean)
    const hasMutations = mutationDefs.length > 0
    const mutationDef = hasMutations ? `type Mutation {\n    ${mutationDefs.join('\n    ')}\n}` : '' // prettier-ignore
    // Figure out the query definitions
    const queryConfigs = resolverConfigs.filter((config) => !config.isMutation)
    const queryResolvers = queryConfigs.reduce(rebuildFromConfig, {})
    const queryDefs = queryConfigs.map(createResolverDefinition).filter(Boolean)
    const hasQueries = queryDefs.length > 0
    const queryDef = hasQueries ? `type Query {\n    ${queryDefs.join('\n    ')}\n}` : ''
    // Figure out the data definitions
    const dataSchemaDefs = Array.from(new Set(createDataDefinitions(resolverConfigs)))
    // Combine all definitions
    const allSchemaDefs = [...dataSchemaDefs, queryDef, mutationDef].filter(Boolean)
    const schemaDefsString = allSchemaDefs.join('\n\n')
    const graphqlSchemaDefs = gql`${schemaDefsString}`
    // Combine all resolvers
    const generatedResolvers = {
        ...(hasQueries ? { Query: queryResolvers } : {}),
        ...(hasMutations ? { Mutation: mutationResolvers } : {}),
    }
    // Return results
    return {
        hasQueries,
        hasMutations,
        generatedResolvers,
        graphqlSchemaDefs,
        schemaDefsString,
    }
}
