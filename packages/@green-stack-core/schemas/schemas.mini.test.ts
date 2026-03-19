// @ts-ignore
import { expect, test } from 'bun:test'
import * as zm from 'zod/v4-mini'
import { schema, inputOptions, addMeta, example, sensitive, index, unique, sparse, introspect, extendSchema, pickSchema, omitSchema } from './schemas.mini'

/* --- Test Resources -------------------------------------------------------------------------- */

const User = schema('User', {
	name: zm.string(),
	age: zm.number(),
})

type User = zm.infer<typeof User>

const Primitives = schema('Primitives', {
	str: zm.optional(zm._default(zm.string(), 'Hello')),
	num: zm._default(zm.number(), 1),
	bln: zm._default(zm.boolean(), false),
	date: zm._default(zm.date(), new Date('2024-01-01')),
})

type Primitives = zm.infer<typeof Primitives>

const AdvancedTypes = schema('AdvancedTypes', {
	enum: inputOptions({ A: 'A', B: 'B', C: 'C' }),
	tuple: zm.tuple([zm.string(), zm.number()]),
	union: zm.union([zm.string(), zm.number()]),
	array: zm.array(zm.string()),
})

type AdvancedTypes = zm.infer<typeof AdvancedTypes>

const Nested = schema('Nested', {
	user: User,
	primitives: Primitives,
	advanced: AdvancedTypes,
})

type Nested = zm.infer<typeof Nested>

/* --- schema() -------------------------------------------------------------------------------- */

test('schema() creates named object with metadata in bag', () => {
	const meta = introspect(User)
	expect(meta.name).toBe('User')
	expect(meta.zodType).toBe('ZodObject')
	expect(meta.schema?.name).toMatchObject({ zodType: 'ZodString', baseType: 'String' })
	expect(meta.schema?.age).toMatchObject({ zodType: 'ZodNumber', baseType: 'Number' })
    // expect(meta.schema?.name.description).toBe('The name of the user') // TODO?
})

test('Schemas can be named via schema()', () => {
	expect(introspect(User).name).toBe('User')
})

/* --- Functional wrappers --------------------------------------------------------------------- */

test('example(), sensitive(), index(), unique(), sparse() add metadata to bag', () => {
	const s1 = example(zm.string(), 'x')
	expect(introspect(s1).exampleValue).toBe('x')
	const s2 = sensitive(zm.string())
	expect(introspect(s2).isSensitive).toBe(true)
	const s3 = index(zm.string())
	expect(introspect(s3).isIndex).toBe(true)
	const s4 = unique(zm.string())
	expect(introspect(s4)).toMatchObject({ isUnique: true, isIndex: true })
	const s5 = sparse(zm.string())
	expect(introspect(s5)).toMatchObject({ isSparse: true, isIndex: true })
})

/* --- addMeta --------------------------------------------------------------------------------- */

test('addMeta merges metadata into schema bag', () => {
	const s = addMeta(zm.string(), { exampleValue: 'test', isSensitive: true })
	expect(introspect(s)).toMatchObject({ exampleValue: 'test', isSensitive: true })
})

/* --- inputOptions ---------------------------------------------------------------------------- */

test('inputOptions creates enum-like schema with entries', () => {
	const Status = inputOptions({ active: 'Active', inactive: 'Inactive' })
    type Status = zm.infer<typeof Status>
	expect(Status.entries).toEqual({ active: 'Active', inactive: 'Inactive' })
	const meta = introspect(Status)
	expect(meta.zodType).toBe('ZodEnum')
	expect(meta.schema).toMatchObject({ active: 'active', inactive: 'inactive' })
})

/* --- Optionality, defaults ------------------------------------------------------------------- */

test('Optionality & defaults persist in schema introspection', () => {
	const meta = introspect(Primitives)
	expect(meta.schema?.str.isOptional).toEqual(true)
	expect(meta.schema?.num.isOptional).toEqual(true)
	expect(meta.schema?.bln.isOptional).toEqual(true)
	expect(meta.schema?.str.defaultValue).toEqual('Hello')
	expect(meta.schema?.num.defaultValue).toEqual(1)
	expect(meta.schema?.bln.defaultValue).toEqual(false)
	expect(meta.schema?.date.defaultValue).toEqual(new Date('2024-01-01'))
})

/* --- Primitives ------------------------------------------------------------------------------ */

test('Primitives zm.string(), zm.number(), zm.boolean(), zm.date() work as expected', () => {
	const meta = introspect(Primitives)
	expect(meta.schema?.str.baseType).toEqual('String')
	expect(meta.schema?.num.baseType).toEqual('Number')
	expect(meta.schema?.bln.baseType).toEqual('Boolean')
	expect(meta.schema?.date.baseType).toEqual('Date')
	expect(meta.schema?.str.zodType).toEqual('ZodString')
	expect(meta.schema?.num.zodType).toEqual('ZodNumber')
	expect(meta.schema?.bln.zodType).toEqual('ZodBoolean')
	expect(meta.schema?.date.zodType).toEqual('ZodDate')
	expect(Primitives.shape.str.parse('Hello')).toEqual('Hello')
	expect(Primitives.shape.num.parse(42)).toEqual(42)
	expect(Primitives.shape.bln.parse(true)).toEqual(true)
	expect(Primitives.shape.date.parse(new Date('2020-01-01'))).toEqual(new Date('2020-01-01'))
})

/* --- index, unique, sparse ------------------------------------------------------------------- */

test('Adds isIndex: true to metadata when index() is called', () => {
	const Index = schema('Index', { index: index(zm.string()) })
	expect(introspect(Index).schema?.index.isIndex).toEqual(true)
})

test('Adds isUnique: true to metadata when unique() is called', () => {
	const Unique = schema('Unique', { unique: unique(zm.string()) })
	expect(introspect(Unique).schema?.unique.isUnique).toEqual(true)
})

test('Adds isSparse: true to metadata when sparse() is called', () => {
	const Sparse = schema('Sparse', { sparse: sparse(zm.string()) })
	expect(introspect(Sparse).schema?.sparse.isSparse).toEqual(true)
})

/* --- Advanced types -------------------------------------------------------------------------- */

test('Advanced types inputOptions, zm.tuple(), zm.union(), zm.array() work as expected', () => {
	const meta = introspect(AdvancedTypes)
	expect(meta.schema?.enum.zodType).toEqual('ZodEnum')
	expect(meta.schema?.tuple.zodType).toEqual('ZodTuple')
	expect(meta.schema?.union.zodType).toEqual('ZodUnion')
	expect(meta.schema?.array.zodType).toEqual('ZodArray')
	expect(meta.schema?.tuple.schema).toHaveLength(2)
	expect(meta.schema?.union.schema).toHaveLength(2)
	expect(meta.schema?.array.schema).toMatchObject({ zodType: 'ZodString', baseType: 'String' })
	expect(AdvancedTypes.shape.enum.parse('B')).toEqual('B')
	expect(AdvancedTypes.shape.tuple.parse(['world', 24])).toEqual(['world', 24])
	expect(AdvancedTypes.shape.union.parse(42)).toEqual(42)
	expect(AdvancedTypes.shape.array.parse(['world'])).toEqual(['world'])
})

/* --- Literals -------------------------------------------------------------------------------- */

test('Recognizes zm.literal() based on the primitive type', () => {
	const Literal = schema('Literal', {
		literalStr: zm.literal('Hello'),
		literalNum: zm.literal(42),
		literalBln: zm.literal(true),
	})
	const meta = introspect(Literal)
	expect(meta.schema?.literalStr.literalValue).toEqual('Hello')
	expect(meta.schema?.literalNum.literalValue).toEqual(42)
	expect(meta.schema?.literalBln.literalValue).toEqual(true)
	expect(meta.schema?.literalStr.literalType).toEqual('string')
	expect(meta.schema?.literalNum.literalType).toEqual('number')
	expect(meta.schema?.literalBln.literalType).toEqual('boolean')
})

/* --- Nested schemas -------------------------------------------------------------------------- */

test('Nested schemas work as expected', () => {
	const nestedMeta = introspect(Nested)
    // Nested Schemas
	expect(nestedMeta.schema?.user.zodType).toEqual('ZodObject')
	expect(nestedMeta.schema?.primitives.zodType).toEqual('ZodObject')
	expect(nestedMeta.schema?.advanced.zodType).toEqual('ZodObject')
    // Parsing Happy Paths
	expect(Nested.shape.user.parse({ name: 'John', age: 42 })).toEqual({ name: 'John', age: 42 })
	expect(Nested.shape.primitives.parse({
		str: 'Hello',
		num: 42,
		bln: true,
		date: new Date('2020-01-01'),
	})).toEqual({ str: 'Hello', num: 42, bln: true, date: new Date('2020-01-01') })
    expect(Nested.shape.advanced.parse({
        enum: 'B',
        tuple: ['world', 24],
        union: 42,
        array: ['world'],
    })).toEqual({
        enum: 'B',
        tuple: ['world', 24],
        union: 42,
        array: ['world'],
    })
    // Introspection
    expect(nestedMeta.schema?.user.name).toEqual('User')
    expect(nestedMeta.schema?.primitives.name).toEqual('Primitives')
    expect(nestedMeta.schema?.advanced.name).toEqual('AdvancedTypes')
})

/* --- introspect(true) with zodStruct --------------------------------------------------------- */

test('Calling introspect(schema, true) includes zodStruct when available', () => {
	const meta = introspect(Nested, true)
	expect(meta.schema?.user.zodStruct).toEqual(User)
	expect(meta.schema?.primitives.zodStruct).toEqual(Primitives)
	expect(meta.schema?.advanced.zodStruct).toEqual(AdvancedTypes)
})

test('wrapped schemas (nullable, optional) preserve introspect/applyDefaults/documentationProps', () => {
	const Base = schema('Base', { name: zm.string(), age: zm.number() })
	const NullableBase = zm.nullable(Base)
	const OptionalBase = zm.optional(Base)
	// Methods should exist on wrappers after patch
	expect(typeof NullableBase.introspect).toBe('function')
	expect(typeof NullableBase.applyDefaults).toBe('function')
	expect(typeof NullableBase.documentationProps).toBe('function')
	expect(typeof OptionalBase.introspect).toBe('function')
	expect(typeof OptionalBase.applyDefaults).toBe('function')
	expect(typeof OptionalBase.documentationProps).toBe('function')
	// introspect unwraps and returns inner metadata
	expect(NullableBase.introspect().name).toBe('Base')
	expect(NullableBase.introspect().schema?.name).toBeDefined()
	// @ts-expect-error - applyDefaults delegates: null passes through for nullable
	expect(NullableBase.applyDefaults(null)).toBe(null)
	expect(NullableBase.applyDefaults({ name: 'Alice', age: 30 })).toEqual({ name: 'Alice', age: 30 })
	// @ts-expect-error -optional: undefined passes through
	expect(OptionalBase.applyDefaults(undefined)).toBe(undefined)
	// _default wrapper: methods available
	const DefaultBase = zm._default(Base, { name: 'unknown', age: 0 })
	expect(typeof DefaultBase.introspect).toBe('function') // @ts-expect-error
	expect(DefaultBase.applyDefaults(undefined)).toEqual({ name: 'unknown', age: 0 })
})

test('introspect handles deeply nested schemas without hanging', () => {
	const Leaf = schema('Leaf', { value: zm.string() })
	const Mid = schema('Mid', { leaf: Leaf })
	const Root = schema('Root', { mid: Mid })
	const meta = introspect(Root)
	expect(meta.name).toBe('Root')
	expect(meta.schema?.mid.name).toBe('Mid') // @ts-ignore
	expect(meta.schema?.mid.schema?.leaf.name).toBe('Leaf')
})

/* --- extendSchema, pickSchema, omitSchema ----------------------------------------------------- */

test('extendSchema(), pickSchema(), omitSchema() work via zm.extend(), zm.pick(), zm.omit()', () => {
	const Base = schema('Base', { a: zm.string(), b: zm.number() })
	const Extended = extendSchema(Base, 'Extended', { c: zm.boolean() })
    type Extended = zm.infer<typeof Extended>
	expect(introspect(Extended).name).toBe('Extended')
	expect(introspect(Extended).schema).toHaveProperty('a')
	expect(introspect(Extended).schema).toHaveProperty('b')
	expect(introspect(Extended).schema).toHaveProperty('c')
	expect(Extended.parse({ a: 'x', b: 1, c: true })).toEqual({ a: 'x', b: 1, c: true })

	const Picked = pickSchema(Base, 'Picked', { a: true })
    type Picked = zm.infer<typeof Picked>
	expect(introspect(Picked).name).toBe('Picked')
	expect(introspect(Picked).schema).toHaveProperty('a')
	expect(introspect(Picked).schema).not.toHaveProperty('b')
	expect(Picked.parse({ a: 'x' })).toEqual({ a: 'x' })

	const Omitted = omitSchema(Base, 'Omitted', { b: true })
    type Omitted = zm.infer<typeof Omitted>
	expect(introspect(Omitted).name).toBe('Omitted')
	expect(introspect(Omitted).schema).toHaveProperty('a')
	expect(introspect(Omitted).schema).not.toHaveProperty('b')
	expect(Omitted.parse({ a: 'x' })).toEqual({ a: 'x' })
})

/* --- applyDefaults --------------------------------------------------------------------------- */

test('applyDefaults() works as expected', () => {
	const WithDefaults = schema('WithDefaults', {
		name: zm._default(zm.string(), 'unknown'),
		age: zm._default(zm.number(), 0),
	})
    type WithDefaults = zm.infer<typeof WithDefaults>
	expect(WithDefaults.applyDefaults({})).toEqual({ name: 'unknown', age: 0 })
	expect(WithDefaults.applyDefaults({ name: 'Alice' })).toEqual({ name: 'Alice', age: 0 })
})

/* --- documentationProps ---------------------------------------------------------------------- */

test('documentationProps() applies exampleValues over defaults in previewProps when applyExamples is used', () => {
	const WithDefaultsAndExamples = schema('WithDefaultsAndExamples', {
		name: example(zm._default(zm.string(), 'unknown'), 'Alice'),
		age: example(zm._default(zm.number(), 0), 25),
	})
	const docProps = WithDefaultsAndExamples.documentationProps('TestComponent', {})
	expect(docProps.componentName).toBe('TestComponent')
	expect(docProps.propSchema).toBe(WithDefaultsAndExamples)
	expect(docProps.previewProps).toEqual({ name: 'Alice', age: 25 })
})
