// @ts-ignore
import { expect, test } from 'bun:test'
import { print } from 'graphql'
import { z, schema } from '../v4'
import { createResolver } from '../createResolver'
import { createSchemaPlugin } from '../createSchemaPlugin'
import { createGraphSchemaDefs } from '../createGraphSchemaDefs'

/* --- Resources ------------------------------------------------------------------------------- */

const HealthCheckInput = schema('HealthCheckInput', { echo: z.string().default('Hello World') })
const HealthCheckOutput = schema('HealthCheckOutput', { echo: z.string().optional(), status: z.literal('OK') })
const healthCheck = createResolver(async ({ args }) => ({ echo: args.echo }), {
    inputSchema: HealthCheckInput,
    outputSchema: HealthCheckOutput,
})

const UserSchema = schema('UserSchema', {
    name: z.string(),
    email: z.string(),
    age: z.number(),
    birthdate: z.date(),
})

const ByID = schema('ByID', {
    id: z.string(),
}).nullish()

const getUser = createResolver(async () => {}, {
    inputSchema: ByID,
    outputSchema: UserSchema,
})

type getUserInput = typeof getUser._input
type getUserOutput = typeof getUser._output

const updateUser = createResolver(async () => {}, {
    inputSchema: UserSchema,
    outputSchema: UserSchema.nullable(),
    isMutation: true,
})

type updateUserInput = typeof updateUser._input
type updateUserOutput = typeof updateUser._output

/* --- Tests ----------------------------------------------------------------------------------- */

test("createSchemaPlugin() applies the correct builder pattern for baseTypes (z4)", () => {
    const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
        Boolean: (schemaKey, fieldMeta) => 'BaseBool',
        String: (schemaKey, fieldMeta) => 'BaseString',
        Number: (schemaKey, fieldMeta) => 'BaseNumber',
        Date: (schemaKey, fieldMeta) => 'BaseDate',
    })
    expect(testPlugin.name).toBe('BaseString')
    expect(testPlugin.email).toBe('BaseString')
    expect(testPlugin.age).toBe('BaseNumber')
    expect(testPlugin.birthdate).toBe('BaseDate')
})

test("createSchemaPlugin() overrides baseType builders for zodType builders (z4)", () => {
    const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
        Boolean: (schemaKey, fieldMeta) => 'BaseBool',
        String: (schemaKey, fieldMeta) => 'BaseString',
        Number: (schemaKey, fieldMeta) => 'BaseNumber',
        Date: (schemaKey, fieldMeta) => 'BaseDate',
        ZodBoolean: (schemaKey, fieldMeta) => 'ZodBool',
        ZodString: (schemaKey, fieldMeta) => 'ZodString',
        ZodNumber: (schemaKey, fieldMeta) => 'ZodNumber',
        ZodDate: (schemaKey, fieldMeta) => 'ZodDate',
    })
    expect(testPlugin.name).toBe('ZodString')
    expect(testPlugin.email).toBe('ZodString')
    expect(testPlugin.age).toBe('ZodNumber')
    expect(testPlugin.birthdate).toBe('ZodDate')
})

test("createSchemaPlugin() overrides zodType builder for schemaKey builders (z4)", () => {
    const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
        Boolean: (schemaKey, fieldMeta) => 'BaseBool',
        String: (schemaKey, fieldMeta) => 'BaseString',
        ZodNumber: (schemaKey, fieldMeta) => 'ZodNumber',
        ZodDate: (schemaKey, fieldMeta) => 'ZodDate',
        name: (schemaKey, fieldMeta) => 'KeyString',
        email: (schemaKey, fieldMeta) => 'KeyString',
        age: (schemaKey, fieldMeta) => 'KeyNumber',
        birthdate: (schemaKey, fieldMeta) => 'KeyDate',
    })
    expect(testPlugin.name).toBe('KeyString')
    expect(testPlugin.email).toBe('KeyString')
    expect(testPlugin.age).toBe('KeyNumber')
    expect(testPlugin.birthdate).toBe('KeyDate')
})

test("createSchemaPlugin() skips fields without a builder (z4)", () => {
    const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
        name: (schemaKey, fieldMeta) => 'KeyString',
    })
    expect(testPlugin.name).toBe('KeyString')
    expect(testPlugin.email).toBe(undefined)
    expect(testPlugin.age).toBe(undefined)
    expect(testPlugin.birthdate).toBe(undefined)
})

test("createSchemaPlugin() builder functions recieve schemaKey as the first arg (z4)", () => {
    const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
        name: (schemaKey, fieldMeta) => schemaKey,
        email: (schemaKey, fieldMeta) => schemaKey,
        age: (schemaKey, fieldMeta) => schemaKey,
        birthdate: (schemaKey, fieldMeta) => schemaKey,
    })
    expect(testPlugin.name).toBe('name')
    expect(testPlugin.email).toBe('email')
    expect(testPlugin.age).toBe('age')
    expect(testPlugin.birthdate).toBe('birthdate')
})

test("createSchemaPlugin() builder functions recieve fieldMeta as the second arg (z4)", () => {
    const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
        name: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
        email: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
        age: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
        birthdate: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
    })
    expect(testPlugin.name).toBe(JSON.stringify(UserSchema.shape.name.introspect()))
    expect(testPlugin.email).toBe(JSON.stringify(UserSchema.shape.email.introspect()))
    expect(testPlugin.age).toBe(JSON.stringify(UserSchema.shape.age.introspect()))
    expect(testPlugin.birthdate).toBe(JSON.stringify(UserSchema.shape.birthdate.introspect()))
})

test("createGraphSchemaDefs() generates a valid GraphQL schema from a list of resolvers (z4)", () => {
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ getUser, updateUser })
    expect(() => print(graphqlSchemaDefs)).not.toThrow()
})

test("createGraphSchemaDefs() correctly splits resolvers into queries & mutations (z4)", () => {
    const queryOnly = createGraphSchemaDefs({ getUser })
    expect(queryOnly.hasQueries).toBe(true)
    expect(queryOnly.hasMutations).toBe(false)
    expect(Object.keys(queryOnly.generatedResolvers!.Query!)).toContain('getUser')
    expect(queryOnly.generatedResolvers!.Mutation).toBeUndefined()
    const mutationOnly = createGraphSchemaDefs({ updateUser })
    expect(mutationOnly.hasQueries).toBe(false)
    expect(mutationOnly.hasMutations).toBe(true)
    expect(mutationOnly.generatedResolvers!.Query).toBeUndefined()
    expect(Object.keys(mutationOnly.generatedResolvers!.Mutation!)).toContain('updateUser')
    const both = createGraphSchemaDefs({ getUser, updateUser })
    expect(both.hasQueries).toBe(true)
    expect(both.hasMutations).toBe(true)
    expect(Object.keys(both.generatedResolvers!.Query!)).toContain('getUser')
    expect(Object.keys(both.generatedResolvers!.Mutation!)).toContain('updateUser')
})

test("createGraphSchemaDefs() generates correct Query & Mutation definitions (z4)", () => {
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ getUser, updateUser })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('Query {')
    expect(printedSchema).toContain('getUser(args: ByIDInput): UserSchema')
    expect(printedSchema).toContain('Mutation {')
    expect(printedSchema).toContain('updateUser(args: UserSchemaInput!): UserSchema')
})

test("createGraphSchemaDefs() generates correct Input & Data definitions (z4)", () => {
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ getUser, updateUser })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('input ByIDInput {')
    expect(printedSchema).toContain('input UserSchemaInput {')
    expect(printedSchema).toContain('type UserSchema {')
    expect(printedSchema).toContain('name: String!')
    expect(printedSchema).toContain('email: String!')
    expect(printedSchema).toContain('age: Float!')
    expect(printedSchema).toContain('birthdate: Date!')
})

test("createGraphSchemaDefs() generates correct nullable output data definitions (z4)", () => {
    const { graphqlSchemaDefs } = createGraphSchemaDefs({
        testOptionals: createResolver(async () => {}, {
            inputSchema: schema('Optional', {
                nullable: z.string().nullable(),
                optional: z.string().optional(),
                defaulted: z.string().default('default'),
            }),
            outputSchema: schema('Optional', {
                nullable: z.string().nullable(),
                optional: z.string().optional(),
                defaulted: z.string().default('default'),
            }),
        }),
    })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('nullable: String')
    expect(printedSchema).not.toContain('nullable: String!')
    expect(printedSchema).toContain('optional: String')
    expect(printedSchema).not.toContain('optional: String!')
    expect(printedSchema).toContain('defaulted: String')
    expect(printedSchema).not.toContain('defaulted: String!')
})

test("createGraphSchemaDefs() can handle resolvers created by createGraphResolver() (z4)", () => {
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ healthCheck })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('Query {')
    expect(printedSchema).toContain('healthCheck(args: HealthCheckInput): HealthCheckOutput')
    expect(printedSchema).toContain('input HealthCheckInput {')
    expect(printedSchema).toContain('type HealthCheckOutput {')
})

test("createGraphSchemaDefs() correctly differentiates between Int & Float (z4)", () => {
    const testSchema = schema('TestSchema', {
        int: z.int(),
        float: z.number(),
    })
    const testResolver = createResolver(async () => {}, {
        inputSchema: testSchema,
        outputSchema: testSchema,
    })
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ testResolver })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('int: Int!')
    expect(printedSchema).toContain('float: Float!')
})

test("createGraphSchemaDefs() renders uuid string fields as GraphQL ID (z4)", () => {
    const WithID = schema('WithID', {
        uuid: z.string().uuid(),
        name: z.string(),
    })
    const testResolver = createResolver(async () => {}, {
        inputSchema: WithID,
        outputSchema: WithID,
    })
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ testResolver })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('uuid: ID!')
    expect(printedSchema).toContain('name: String!')
})

test("createGraphSchemaDefs() omits sensitive fields from output type definitions (z4)", () => {
    const WithSensitive = schema('WithSensitive', {
        name: z.string(),
        secret: z.string().sensitive(),
    })
    const testResolver = createResolver(async () => {}, {
        inputSchema: WithSensitive,
        outputSchema: WithSensitive,
    })
    const { graphqlSchemaDefs } = createGraphSchemaDefs({ testResolver })
    const printedSchema = print(graphqlSchemaDefs)
    expect(printedSchema).toContain('name: String!')
    expect(printedSchema).not.toContain('secret:')
})
