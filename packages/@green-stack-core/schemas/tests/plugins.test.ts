// @ts-ignore
import { expect, test } from 'bun:test'
import { print } from 'graphql'
import { z, schema } from '../index'
import { createSchemaPlugin } from '../createSchemaPlugin'
import { createGraphSchemaDefs } from '../createGraphSchemaDefs'

/* --- Mock healthCheck resolver (lives in @app/demo, avoid loading in test env) ------------- */

const HealthCheckInput = schema('HealthCheckInput', { echo: z.string().default('Hello World') })
const HealthCheckOutput = schema('HealthCheckOutput', { echo: z.string().optional(), status: z.literal('OK') })
const healthCheck = Object.assign(async () => ({}), { argSchema: HealthCheckInput, resSchema: HealthCheckOutput })

/* --- createSchemaPlugin() -------------------------------------------------------------------- */

const UserSchema = schema('UserSchema', {
  name: z.string(),
  email: z.string(),
  age: z.number(),
  birthdate: z.date(),
})

test("createSchemaPlugin() applies the correct builder pattern for baseTypes", () => {
  // Schema transformer to test
  const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
    Boolean: (schemaKey, fieldMeta) => 'BaseBool',
    String: (schemaKey, fieldMeta) => 'BaseString',
    Number: (schemaKey, fieldMeta) => 'BaseNumber',
    Date: (schemaKey, fieldMeta) => 'BaseDate',
  })
  // Check the result
  expect(testPlugin.name).toBe('BaseString')
  expect(testPlugin.email).toBe('BaseString')
  expect(testPlugin.age).toBe('BaseNumber')
  expect(testPlugin.birthdate).toBe('BaseDate')
})

test("createSchemaPlugin() overrides baseType builders for zodType builders", () => {
  // Schema transformer to test
  const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
    // Least specific: Should be overridden by more specific mappers
    Boolean: (schemaKey, fieldMeta) => 'BaseBool',
    String: (schemaKey, fieldMeta) => 'BaseString',
    Number: (schemaKey, fieldMeta) => 'BaseNumber',
    Date: (schemaKey, fieldMeta) => 'BaseDate',
    // More specific: Should override any generic builder
    ZodBoolean: (schemaKey, fieldMeta) => 'ZodBool',
    ZodString: (schemaKey, fieldMeta) => 'ZodString',
    ZodNumber: (schemaKey, fieldMeta) => 'ZodNumber',
    ZodDate: (schemaKey, fieldMeta) => 'ZodDate',
  })
  // Check the result
  expect(testPlugin.name).toBe('ZodString')
  expect(testPlugin.email).toBe('ZodString')
  expect(testPlugin.age).toBe('ZodNumber')
  expect(testPlugin.birthdate).toBe('ZodDate')
})

test("createSchemaPlugin() overrides zodType builder for schemaKey builders", () => {
  // Schema transformer to test
  const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
    // Least specific: Should be overridden by more specific mappers
    Boolean: (schemaKey, fieldMeta) => 'BaseBool',
    String: (schemaKey, fieldMeta) => 'BaseString',
    // More specific: Should override any generic builder
    ZodNumber: (schemaKey, fieldMeta) => 'ZodNumber',
    ZodDate: (schemaKey, fieldMeta) => 'ZodDate',
    // Most specific: Should override all other builders
    name: (schemaKey, fieldMeta) => 'KeyString',
    email: (schemaKey, fieldMeta) => 'KeyString',
    age: (schemaKey, fieldMeta) => 'KeyNumber',
    birthdate: (schemaKey, fieldMeta) => 'KeyDate',
  })
  // Check the result
  expect(testPlugin.name).toBe('KeyString')
  expect(testPlugin.email).toBe('KeyString')
  expect(testPlugin.age).toBe('KeyNumber')
  expect(testPlugin.birthdate).toBe('KeyDate')
})

test("createSchemaPlugin() skips fields without a builder", () => {
  // Schema transformer to test
  const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
    // Only provide a builder for the 'name' field
    name: (schemaKey, fieldMeta) => 'KeyString',
  })
  // Check the result
  expect(testPlugin.name).toBe('KeyString')
  // All other fields should be skipped
  expect(testPlugin.email).toBe(undefined)
  expect(testPlugin.age).toBe(undefined)
  expect(testPlugin.birthdate).toBe(undefined)
})

test("createSchemaPlugin() builder functions recieve schemaKey as the first arg", () => {
  // Schema transformer to test
  const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
    name: (schemaKey, fieldMeta) => schemaKey,
    email: (schemaKey, fieldMeta) => schemaKey,
    age: (schemaKey, fieldMeta) => schemaKey,
    birthdate: (schemaKey, fieldMeta) => schemaKey,
  })
  // Check the result
  expect(testPlugin.name).toBe('name')
  expect(testPlugin.email).toBe('email')
  expect(testPlugin.age).toBe('age')
  expect(testPlugin.birthdate).toBe('birthdate')
})

test("createSchemaPlugin() builder functions recieve fieldMeta as the second arg", () => {
  // Schema transformer to test
  const testPlugin = createSchemaPlugin(UserSchema.introspect(), {
    name: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
    email: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
    age: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
    birthdate: (schemaKey, fieldMeta) => JSON.stringify(fieldMeta),
  })
  // Check the result
  expect(testPlugin.name).toBe(JSON.stringify(UserSchema.shape.name.introspect()))
  expect(testPlugin.email).toBe(JSON.stringify(UserSchema.shape.email.introspect()))
  expect(testPlugin.age).toBe(JSON.stringify(UserSchema.shape.age.introspect()))
  expect(testPlugin.birthdate).toBe(JSON.stringify(UserSchema.shape.birthdate.introspect()))
})

/* --- createGraphSchemaDefs() ----------------------------------------------------------------- */

const ByID = schema('ByID', { id: z.string() }).nullish()

const getUser = Object.assign(async () => {}, {
  argSchema: ByID,
  resSchema: UserSchema,
})

const updateUser = Object.assign(async () => {}, {
  argSchema: UserSchema,
  resSchema: UserSchema.nullable(),
  isMutation: true,
})

test("createGraphSchemaDefs() generates a valid GraphQL schema from a list of resolvers", () => {
  const { graphqlSchemaDefs } = createGraphSchemaDefs({ getUser, updateUser })
  // Check if the generated schema is valid
  expect(() => print(graphqlSchemaDefs)).not.toThrow()
})

test("createGraphSchemaDefs() correctly splits resolvers into queries & mutations", () => {
  // Only queries
  const queryOnly = createGraphSchemaDefs({ getUser })
  expect(queryOnly.hasQueries).toBe(true)
  expect(queryOnly.hasMutations).toBe(false)
  expect(Object.keys(queryOnly.generatedResolvers!.Query)).toContain('getUser')
  expect(queryOnly.generatedResolvers!.Mutation).toBeUndefined()
  // Only mutations
  const mutationOnly = createGraphSchemaDefs({ updateUser })
  expect(mutationOnly.hasQueries).toBe(false)
  expect(mutationOnly.hasMutations).toBe(true)
  expect(mutationOnly.generatedResolvers!.Query).toBeUndefined()
  expect(Object.keys(mutationOnly.generatedResolvers!.Mutation)).toContain('updateUser')
  // Both queries & mutations
  const both = createGraphSchemaDefs({ getUser, updateUser })
  expect(both.hasQueries).toBe(true)
  expect(both.hasMutations).toBe(true)
  expect(Object.keys(both.generatedResolvers!.Query)).toContain('getUser')
  expect(Object.keys(both.generatedResolvers!.Mutation)).toContain('updateUser')
})

test("createGraphSchemaDefs() generates correct Query { .. } & Mutation { ... } definitions", () => {
  const { graphqlSchemaDefs } = createGraphSchemaDefs({ getUser, updateUser })
  const printedSchema = print(graphqlSchemaDefs)
  // Check queries
  expect(printedSchema).toContain('Query {')
  expect(printedSchema).toContain('getUser(args: ByIDInput): UserSchema')
  // Check mutations
  expect(printedSchema).toContain('Mutation {')
  expect(printedSchema).toContain('updateUser(args: UserSchemaInput!): UserSchema')
})

test("createGraphSchemaDefs() generates correct Input & Data definitions", () => {
  const { graphqlSchemaDefs } = createGraphSchemaDefs({ getUser, updateUser })
  const printedSchema = print(graphqlSchemaDefs)
  // Check input data definitions
  expect(printedSchema).toContain('input ByIDInput {')
  expect(printedSchema).toContain('input UserSchemaInput {')
  // Check output data definitions
  expect(printedSchema).toContain('type UserSchema {')
  // Check field definitions
  expect(printedSchema).toContain('name: String!')
  expect(printedSchema).toContain('email: String!')
  expect(printedSchema).toContain('age: Float!')
  expect(printedSchema).toContain('birthdate: Date!')
})

test("createGraphSchemaDefs() generates correct nullable output data definitions", () => {
  const { graphqlSchemaDefs } = createGraphSchemaDefs({
    testOptionals: Object.assign(async () => {}, {
      argSchema: schema('Optional', {
        nullable: z.string().nullable(),
        optional: z.string().optional(),
        defaulted: z.string().default('default'),
      }),
      resSchema: schema('Optional', {
        nullable: z.string().nullable(),
        optional: z.string().optional(),
        defaulted: z.string().default('default'),
      }),
    }),
  })
  const printedSchema = print(graphqlSchemaDefs)
  // Check nullable field definitions
  expect(printedSchema).toContain('nullable: String')
  expect(printedSchema).not.toContain('nullable: String!')
  // Check optional field definitions
  expect(printedSchema).toContain('optional: String')
  expect(printedSchema).not.toContain('optional: String!')
  // Check defaulted field definitions
  expect(printedSchema).toContain('defaulted: String')
  expect(printedSchema).not.toContain('defaulted: String!')
})

test("createGraphSchemaDefs() can handle resolvers created by createGraphResolver()", () => {
  const { graphqlSchemaDefs } = createGraphSchemaDefs({ healthCheck })
  const printedSchema = print(graphqlSchemaDefs)
  // Check queries
  expect(printedSchema).toContain('Query {')
  expect(printedSchema).toContain('healthCheck(args: HealthCheckInput): HealthCheckOutput')
  // Check input definitions
  expect(printedSchema).toContain('input HealthCheckInput {')
  // Check output definitions
  expect(printedSchema).toContain('type HealthCheckOutput {')
})

test("createGraphSchemaDefs() correctly differentiates between Int & Float", () => {
  const testSchema = schema('TestSchema', {
    int: z.number().int(),
    float: z.number(), // Default is Float
  })
  const testResolver = Object.assign(async () => {}, {
    argSchema: testSchema,
    resSchema: testSchema,
  })
  const { graphqlSchemaDefs } = createGraphSchemaDefs({ testResolver })
  const printedSchema = print(graphqlSchemaDefs)
  // Check field definitions
  expect(printedSchema).toContain('int: Int!')
  expect(printedSchema).toContain('float: Float!')
})
