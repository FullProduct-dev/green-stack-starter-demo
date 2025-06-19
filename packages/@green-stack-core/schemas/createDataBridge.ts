import { TadaDocumentNode, graphql, VariablesOf, ResultOf } from 'gql.tada'
import { print } from 'graphql'
import { z, Metadata, Meta$Schema } from './index'
import { lowercaseFirstChar } from '../utils/stringUtils'

/* --- Constants ------------------------------------------------------------------------------- */

const INPUT_INDICATORS = ['Input', 'Args', 'Arguments'] as const

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'GRAPHQL'] as const

/* --- Types ----------------------------------------------------------------------------------- */

export type INPUT_INDICATORS = typeof INPUT_INDICATORS[number]

export type ALLOWED_METHODS = typeof ALLOWED_METHODS[number]

/** --- normalizeInputSchemaName() ------------------------------------------------------------- */
/** -i- Appends schema name with 'Input', but only if there isn't already an indicator of input in there */
export const normalizeInputSchemaName = (schemaName: string, prefix: 'type' | 'input') => {
    const isInputSchemaName = INPUT_INDICATORS.some((term) => schemaName?.includes(term))
    if (prefix === 'input' && !isInputSchemaName) return `${schemaName}Input`
    return schemaName
}

/** --- renderGraphqlQuery() ------------------------------------------------------------------- */
/** -i- Accepts a resolverName, inputSchema and outputSchema and spits out a graphql query that stops at 3 levels (or a custom number) of depth */
export const renderGraphqlQuery = <ArgsShape extends z.ZodRawShape, ResShape extends z.ZodRawShape>({
    resolverName,
    resolverArgsName,
    resolverType,
    inputSchema,
    outputSchema,
    maxFieldDepth = 5,
    logWarnings = true,
}: {
    resolverName: string
    resolverArgsName: string
    resolverType: 'query' | 'mutation'
    inputSchema: z.ZodObject<ArgsShape>
    outputSchema: z.ZodObject<ResShape>
    maxFieldDepth?: number
    logWarnings?: boolean
}) => {
    // Introspect input & output schemas
    const argsSchemaDefs = inputSchema.introspect()
    const responseSchemaDefs = outputSchema.introspect()
    let argsInputName = normalizeInputSchemaName(argsSchemaDefs.name!, 'input')
    const _resolverArgsName = lowercaseFirstChar(resolverArgsName)

    // Determine nullability of args
    const isRequired = !argsSchemaDefs.isNullable && !argsSchemaDefs.isOptional
    if (isRequired) argsInputName = `${argsInputName}!`

    // Build query base
    let query = `${resolverType} ${resolverName}($${_resolverArgsName}: ${argsInputName}) {\n    {{body}}\n}` // prettier-ignore
    query = query.replace('{{body}}', `${resolverName}(args: $${_resolverArgsName}) {\n{{fields}}\n    }`) // prettier-ignore

    // Re-evaluate query setup if there are no args
    // @ts-ignore
    const hasArgs = Object.keys(argsSchemaDefs.schema).length > 0
    if (!hasArgs) {
        query = `${resolverType} ${resolverName} {\n  {{body}}\n}`
        query = query.replace('{{body}}', `${resolverName} {\n{{fields}}\n    }`)
    }

    // Nestable field builder
    const renderFields = (schema: Meta$Schema, depth: number, fieldName?: string) => {
        try {
            const fieldKeys = Object.keys(schema.schema || schema)
            const fieldEntries = fieldKeys.map((fieldKey): string => {
                // @ts-ignore
                const fieldConfig = (schema.schema?.[fieldKey] || schema[fieldKey]) as Metadata
                const zodType = fieldConfig.zodType
                const fieldType = fieldConfig.baseType
                const spacing = '    '.repeat(depth)

                // Skip sensitive fields
                if (fieldConfig.isSensitive) return ''

                // Skip incompatible types
                const INCOMPATIBLES = ['ZodRecord', 'ZodIntersection', 'ZodDiscriminatedUnion', 'ZodVoid', 'ZodFunction', 'ZodPromise', 'ZodLazy', 'ZodEffects'] as const // prettier-ignore
                if (logWarnings && INCOMPATIBLES.includes(zodType as any)) {
                    console.log(`-!- Skipping incompatible type in automatic graphql query build: field '${fieldKey}' of type '${zodType}' is unsupported.`)
                    console.log("-i- When creating a data bridge with this field type, you'll need to manually pass the 'graphqlQuery' field with gql.tada upon creation.")
                    console.log("-i- Alternatively, please stick to using the allowed types for GraphQL: z.string, z.number, z.boolean, z.date, z.array, z.object, z.literal, z.enum, z.nativeEnum, and simple z.union types.")
                    return ''
                }

                // Render fields with no nesting
                const UNNESTABLES = ['ZodString', 'ZodNumber', 'ZodBoolean', 'ZodDate', 'ZodLiteral', 'ZodEnum', 'ZodNativeEnum'] as const
                if (UNNESTABLES.includes(zodType as any)) return `${spacing}${fieldKey}`

                // Handle regular arrays and tuples
                const isArray = fieldType === 'Array'
                const isNonObjectLike = !['Object', 'Array'].includes(fieldType) // @ts-ignore
                const isNonObjectArray = isArray && !['Object', 'Array'].includes(fieldConfig.schema?.baseType) // prettier-ignore
                const hasNoSubFields = isNonObjectLike || isNonObjectArray
                if (hasNoSubFields) return `${spacing}${fieldKey}`

                // Stop a max depth
                if (depth >= maxFieldDepth) {
                    console.log(`-!- Skipping field '${fieldKey}' in automatic graphql query build due to max depth of ${maxFieldDepth} reached.`)
                    console.log("You can pass a custom 'maxFieldDepth' to the createDataBridge() function to increase the depth.")
                    console.log("Alternatively, you could pass a custom GraphQL query with gql.tada in the optional 'graphqlQuery' field.")
                    return `${spacing}${fieldKey}`
                }

                // Handle nested types
                let objectSchema = fieldConfig.schema as Meta$Schema
                return `${spacing}${fieldKey} {\n${renderFields(objectSchema, depth + 1, fieldKey)}\n${spacing}}`
            })
            return fieldEntries.filter(Boolean).join('\n')
        } catch (error) {
            console.error('Error rendering fields', error, JSON.stringify({ fieldName, schema }, null, 2))
            return ''
        }
    }

    // Render fields into the query
    const fields = renderFields(responseSchemaDefs as Meta$Schema, 2)
    query = query.replace('{{fields}}', fields)
    return query
}

/** --- createDataBridge() --------------------------------------------------------------------- */
/** -i- Create a reusable bridge object between a resolver and a page */
export const createDataBridge = <
    ResolverName extends string,
    ArgsShape extends z.ZodRawShape,
    ResShape extends z.ZodRawShape,
    CustomQuery extends TadaDocumentNode | null = null,
    ResolverArgsName extends `${ResolverName}Args` | HintedKeys = `${ResolverName}Args`,
    DefaultQueryArgs = PrettifySingleKeyRecord<Record<LowercaseFirstChar<ResolverArgsName>, z.ZodObject<ArgsShape>['_input']>>,
    DefaultQueryRes = PrettifySingleKeyRecord<Record<ResolverName, z.ZodObject<ResShape>['_output']>>,
    QueryArgs = CustomQuery extends null ? DefaultQueryArgs : VariablesOf<CustomQuery>,
    QueryRes = CustomQuery extends null ? DefaultQueryRes : ResultOf<CustomQuery>,
>({
    resolverName,
    resolverType: customResolverType,
    resolverArgsName = `${resolverName}Args`,
    inputSchema,
    outputSchema,
    apiPath,
    allowedMethods,
    graphqlQuery,
    ...restOptions
}: {
    resolverName: ResolverName
    resolverType?: 'query' | 'mutation'
    resolverArgsName?: ResolverArgsName | HintedKeys
    inputSchema: z.ZodObject<ArgsShape>
    outputSchema: z.ZodObject<ResShape>
    apiPath?: string
    allowedMethods?: ALLOWED_METHODS[]
    graphqlQuery?: CustomQuery
    isMutation?: boolean
}) => {
    // Vars & Flags
    const printedQuery = graphqlQuery ? print(graphqlQuery) : ''
    const containsMutation = printedQuery?.includes?.('mutation')
    const isMutation = restOptions.isMutation || containsMutation
    const resolverType = customResolverType || (isMutation ? 'mutation' : 'query')

    // -- Error Checks --

    if (!resolverName) throw new Error('createDataBridge() -!- Resolver name is required')
    if (!inputSchema) throw new Error('createDataBridge() -!- Args schema is required')
    if (!outputSchema) throw new Error('createDataBridge() -!- Response schema is required')

    // -- Build default graphql query? --

    const getGraphqlQuery = (showPrintedQuery = false, logWarnings = true) => {
        // Return custom query if provided
        if (graphqlQuery && !showPrintedQuery) {
            return graphqlQuery as TadaDocumentNode<QueryRes, QueryArgs>
        }

        // Build a default query otherwise
        const defaultGraphqlQueryString = renderGraphqlQuery({
            resolverName,
            resolverArgsName,
            resolverType,
            inputSchema,
            outputSchema,
            logWarnings,
        })

        // Return the query as a string
        if (showPrintedQuery) return defaultGraphqlQueryString

        // Return the query as a TadaDocumentNode
        const gqlArgsSchema = z.object({ [resolverName as ResolverName]: inputSchema })
        const gqlResSchema = z.object({ [resolverName as ResolverName]: outputSchema })
        const documentNode = graphql(defaultGraphqlQueryString) as TadaDocumentNode<
            z.infer<typeof gqlArgsSchema>,
            z.infer<typeof gqlResSchema>
        >
        return documentNode as TadaDocumentNode<QueryRes, QueryArgs>
    }

    // -- Return Data Bridge --

    return {
        resolverName,
        resolverType,
        resolverArgsName,
        inputSchema,
        outputSchema,
        apiPath,
        allowedMethods,
        isMutation,
        getGraphqlQuery,
        _input: undefined as unknown as z.ZodObject<ArgsShape>['_input'],
        _output: undefined as unknown as z.ZodObject<ResShape>['_output'],
    }
}

/* --- Exported Types -------------------------------------------------------------------------- */

export type DataBridgeType = ReturnType<typeof createDataBridge>
