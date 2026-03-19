// @ts-ignore
import { expect, test } from 'bun:test'
import { z, schema, Meta$Schema } from './schemas.v3'
import { ZodError } from 'zod'

/* --- Test Resources -------------------------------------------------------------------------- */

const User = schema('User', {
    name: z.string(),
    age: z.number(),
})

type User = z.infer<typeof User>

const Primitives = schema('Primitives', {
    str: z.string().min(1).max(10).nullish().default('Hello').example('World').describe('somestring'),
    num: z.number().min(1).max(50).default(1).example(42).describe('Number'),
    bln: z.boolean().default(false).example(true).describe('Boolean'),
    date: z.date().default(new Date('2024-01-01')).example(new Date('2020-01-01')).describe('Date'),
})

type Primitives = z.infer<typeof Primitives>

const AdvancedTypes = schema('AdvancedTypes', {
    enum: z.enum(['A', 'B', 'C']).default('A').example('B'),
    tuple: z.tuple([z.string(), z.number()]).default(['hello', 42]).example(['world', 24]),
    union: z.union([z.string(), z.number()]).default('hello').example(42),
    array: z.array(z.string()).min(0).max(5).length(1).default([]).example(['world']),
})

type AdvancedTypes = z.infer<typeof AdvancedTypes>

const Nested = schema('Nested', {
    user: User,
    primitives: Primitives,
    advanced: AdvancedTypes,
})

type Nested = z.infer<typeof Nested>

/* --- Tests ----------------------------------------------------------------------------------- */

test("Schemas can be introspected", () => {
    expect(User.introspect).toBeInstanceOf(Function)
    expect(User.introspect()).toEqual({
        name: 'User',
        zodType: 'ZodObject',
        baseType: 'Object',
        schema: {
            name: { zodType: 'ZodString', baseType: 'String' },
            age: { zodType: 'ZodNumber', baseType: 'Number' },
        },
    })
})

test("Schemas can be named and renamed", () => {
    expect(User.introspect().name).toBe('User')
    const User2 = User.nameSchema('User2')
    expect(User2.introspect().name).toBe('User2')
    expect(User.introspect().name).toBe('User')
})

test("Optionality, defaults & example values persist in schema introspection", () => {
    const metadata = Primitives.introspect() as Meta$Schema
    // Optionality
    expect(metadata.schema?.str.isOptional).toEqual(true)
    expect(metadata.schema?.str.isNullable).toEqual(true)
    expect(metadata.schema?.num.isOptional).toEqual(true) // Default makes it optional
    expect(metadata.schema?.num.isNullable).toBeFalsy()
    expect(metadata.schema?.bln.isOptional).toEqual(true)
    expect(metadata.schema?.bln.isNullable).toBeFalsy()
    // Default Values
    expect(metadata.schema?.str.defaultValue).toEqual('Hello')
    expect(metadata.schema?.num.defaultValue).toEqual(1)
    expect(metadata.schema?.bln.defaultValue).toEqual(false)
    expect(metadata.schema?.date.defaultValue).toEqual(new Date('2024-01-01'))
    // Examples
    expect(metadata.schema?.str.exampleValue).toEqual('World')
    expect(metadata.schema?.num.exampleValue).toEqual(42)
    expect(metadata.schema?.bln.exampleValue).toEqual(true)
    expect(metadata.schema?.date.exampleValue).toEqual(new Date('2020-01-01'))
})

test("Descriptions persist in introspection, no matter where they're defined", () => {
    const DescriptionTest = schema('DescriptionTest', {
        str: z.coerce.string().describe('Some string').nullish(),
        num: z.coerce.number().default(1).describe('Some number'),
        bln: z.coerce.boolean().example(true).describe('Some boolean').optional(),
        date: z.coerce.date().describe('Some date').nullable(),
    })
    const metadata = DescriptionTest.introspect() as Meta$Schema
    expect(metadata.schema?.str.description).toEqual('Some string')
    expect(metadata.schema?.num.description).toEqual('Some number')
    expect(metadata.schema?.bln.description).toEqual('Some boolean')
    expect(metadata.schema?.date.description).toEqual('Some date')
})

test("Supports custom error messages for each validation step", () => {
    const ErrorTest = schema('ErrorTest', {
        str: z.string().min(1, { message: 'Too short' }).max(10, { message: 'Too long' }),
        num: z.number().min(1, { message: 'Too low' }).max(50, { message: 'Too high' }),
    })
    // Default Error Messages
    expect(() => ErrorTest.shape.num.parse('')).toThrow(new ZodError([{
        code: 'invalid_type',
        expected: 'number',
        received: 'string',
        path: [],
        message: 'Expected number, received string',
    }]))
    expect(() => ErrorTest.shape.str.parse(0)).toThrow(new ZodError([{
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: [],
        message: 'Expected string, received number',
    }]))
    // Custom Error Messages
    expect(() => ErrorTest.shape.str.parse('')).toThrow('Too short')
    expect(() => ErrorTest.shape.str.parse('Hello World!')).toThrow('Too long')
    expect(() => ErrorTest.shape.num.parse(0)).toThrow('Too low')
    expect(() => ErrorTest.shape.num.parse(51)).toThrow('Too high')
})

/* --- Primitives ------------------------------------------------------------------------------ */

test("Primitives z.string(), z.number(), z.boolean() & z.date() work as expected", () => {
    const metadata = Primitives.introspect() as Meta$Schema
    // Base Types
    expect(metadata.schema?.str.baseType).toEqual('String')
    expect(metadata.schema?.num.baseType).toEqual('Number')
    expect(metadata.schema?.bln.baseType).toEqual('Boolean')
    expect(metadata.schema?.date.baseType).toEqual('Date')
    // Type Names
    expect(metadata.schema?.str.zodType).toEqual('ZodString')
    expect(metadata.schema?.num.zodType).toEqual('ZodNumber')
    expect(metadata.schema?.bln.zodType).toEqual('ZodBoolean')
    expect(metadata.schema?.date.zodType).toEqual('ZodDate')
    // Min / Max
    expect(metadata.schema?.str.minLength).toEqual(1)
    expect(metadata.schema?.str.maxLength).toEqual(10)
    expect(metadata.schema?.num.minValue).toEqual(1)
    expect(metadata.schema?.num.maxValue).toEqual(50)
    // Parsing Happy Paths
    expect(Primitives.shape.str.parse('Hello')).toEqual('Hello')
    expect(Primitives.shape.num.parse(42)).toEqual(42)
    expect(Primitives.shape.bln.parse(true)).toEqual(true)
    expect(Primitives.shape.date.parse(new Date('2020-01-01'))).toEqual(new Date('2020-01-01'))
    // Parsing Unhappy Paths
    expect(() => Primitives.shape.str.parse('')).toThrow() // Too short
    expect(() => Primitives.shape.str.parse('Hello World!')).toThrow() // Too long
    expect(() => Primitives.shape.num.parse("0")).toThrow() // Too low, wrong type
    expect(() => Primitives.shape.num.parse(51)).toThrow() // Too high
})

/* --- Subtypes -------------------------------------------------------------------------------- */

test("Adds isInt metadata to z.number().int()", () => {
    const Int = schema('Int', {
        int: z.number().int(),
    })
    const metadata = Int.introspect() as Meta$Schema
    expect(metadata.schema?.int.zodType).toEqual('ZodNumber')
    expect(metadata.schema?.int.isInt).toEqual(true)
})

test("Adds isBase64 / isEmail / isUUID / isURL / isDate metadata to z.string() subtypes", () => {
    const StringSubtypes = schema('StringSubtypes', {
        base64: z.string().base64(),
        email: z.string().email(),
        uuid: z.string().uuid(),
        url: z.string().url(),
        date: z.string().date(),
        datetime: z.string().datetime(),
        time: z.string().time(),
        ip: z.string().ip(),
    })
    const metadata = StringSubtypes.introspect() as Meta$Schema
    // Check subtypes
    expect(metadata.schema?.base64.isBase64).toEqual(true)
    expect(metadata.schema?.email.isEmail).toEqual(true)
    expect(metadata.schema?.uuid.isUUID).toEqual(true)
    expect(metadata.schema?.url.isURL).toEqual(true)
    expect(metadata.schema?.date.isDate).toEqual(true)
    expect(metadata.schema?.datetime.isDatetime).toEqual(true)
    expect(metadata.schema?.time.isTime).toEqual(true)
    expect(metadata.schema?.ip.isIP).toEqual(true)
    // Check that isID is set when isUUID is also true
    expect(metadata.schema?.uuid.isID).toEqual(true)
})

/* --- Compatibility --------------------------------------------------------------------------- */

test("Adds isIndex: true to metadata when .index() is called", () => {
    const Index = schema('Index', {
        index: z.string().index(),
    })
    const metadata = Index.introspect() as Meta$Schema
    expect(metadata.schema?.index.isIndex).toEqual(true)
})

test("Adds isUnique: true to metadata when .unique() is called", () => {
    const Unique = schema('Unique', {
        unique: z.string().unique(),
    })
    const metadata = Unique.introspect() as Meta$Schema
    expect(metadata.schema?.unique.isUnique).toEqual(true)
})

test("Adds isSparse: true to metadata when .sparse() is called", () => {
    const Sparse = schema('Sparse', {
        sparse: z.string().sparse(),
    })
    const metadata = Sparse.introspect() as Meta$Schema
    expect(metadata.schema?.sparse.isSparse).toEqual(true)
})

/* --- Advanced Types -------------------------------------------------------------------------- */

test("Advanced types z.enum(), z.tuple(), z.union() & z.array() work as expected", () => {
    const metadata = AdvancedTypes.introspect() as Meta$Schema
    // Base Types
    expect(metadata.schema?.enum.baseType).toEqual('String')
    expect(metadata.schema?.tuple.baseType).toEqual('Any') // Experimental support, serialized as JSON
    expect(metadata.schema?.union.baseType).toEqual('Any') // String | Number, serialized as JSON
    expect(metadata.schema?.array.baseType).toEqual('Array')
    // Type Names
    expect(metadata.schema?.enum.zodType).toEqual('ZodEnum')
    expect(metadata.schema?.tuple.zodType).toEqual('ZodTuple')
    expect(metadata.schema?.union.zodType).toEqual('ZodUnion')
    expect(metadata.schema?.array.zodType).toEqual('ZodArray')
    // Enums
    expect(metadata.schema?.enum.schema).toEqual({
        A: 'A',
        B: 'B',
        C: 'C',
    })
    // Tuples
    expect(metadata.schema?.tuple.schema).toEqual([
        { zodType: 'ZodString', baseType: 'String' },
        { zodType: 'ZodNumber', baseType: 'Number' },
    ])
    // Unions
    expect(metadata.schema?.union.schema).toEqual([
        { zodType: 'ZodString', baseType: 'String' },
        { zodType: 'ZodNumber', baseType: 'Number' },
    ])
    // Array
    expect(metadata.schema?.array.schema).toEqual({ zodType: 'ZodString', baseType: 'String' })
    expect(metadata.schema?.array.minLength).toEqual(0)
    expect(metadata.schema?.array.maxLength).toEqual(5)
    // Parsing Happy Paths
    expect(AdvancedTypes.shape.enum.parse('B')).toEqual('B')
    expect(AdvancedTypes.shape.tuple.parse(['world', 24])).toEqual(['world', 24])
    expect(AdvancedTypes.shape.union.parse(42)).toEqual(42)
    expect(AdvancedTypes.shape.array.parse(['world'])).toEqual(['world'])
    // Parsing Unhappy Paths
    expect(() => AdvancedTypes.shape.enum.parse('D')).toThrow() // Not in enum
    expect(() => AdvancedTypes.shape.tuple.parse(['world', '24'])).toThrow() // Wrong type
    expect(() => AdvancedTypes.shape.union.parse(false)).toThrow() // Wrong type
    expect(() => AdvancedTypes.shape.array.parse(['world', '24'])).toThrow() // Too long
})

test("Recognizes z.literal() based on the primitive type of the literal's value", () => {
    const Literal = schema('Literal', {
        literalStr: z.literal('Hello'),
        literalNum: z.literal(42),
        literalBln: z.literal(true),
    })
    const metadata = Literal.introspect() as Meta$Schema
    // Metadata should contain the literal value
    expect(metadata.schema?.literalStr.literalValue).toEqual('Hello')
    expect(metadata.schema?.literalNum.literalValue).toEqual(42)
    expect(metadata.schema?.literalBln.literalValue).toEqual(true)
    // Metadata should contain the literal type
    expect(metadata.schema?.literalStr.literalType).toEqual('string')
    expect(metadata.schema?.literalNum.literalType).toEqual('number')
    expect(metadata.schema?.literalBln.literalType).toEqual('boolean')
    // Metadata should contain the literal baseType
    expect(metadata.schema?.literalStr.literalBase).toEqual('String')
    expect(metadata.schema?.literalNum.literalBase).toEqual('Number')
    expect(metadata.schema?.literalBln.literalBase).toEqual('Boolean')
    // Base Types
    expect(metadata.schema?.literalStr.baseType).toEqual('String')
    expect(metadata.schema?.literalNum.baseType).toEqual('Number')
    expect(metadata.schema?.literalBln.baseType).toEqual('Boolean')
})

/* --- Derived Schemas ------------------------------------------------------------------------- */

test("Deriving schemas with .extendSchema(), .omitSchema(), .pickSchema() work as expected", () => {
    // Extend 
    const Extended = Primitives.extendSchema('Extended', {
        newField: z.string().default('Hello'),
    })
    type Extended = z.infer<typeof Extended>
    expect(Extended.introspect().name).toBe('Extended')
    expect(Extended.introspect().schema).toHaveProperty('newField')
    expect(Extended.parse({ newField: 'World' })).toEqual({
        newField: 'World',
        str: 'Hello',
        num: 1,
        bln: false,
        date: new Date('2024-01-01'),
    })
    // Omit
    const Omitted = Primitives.omitSchema('Omitted', { str: true })
    type Omitted = z.infer<typeof Omitted>
    expect(Omitted.introspect().name).toBe('Omitted')
    expect(Omitted.introspect().schema).not.toHaveProperty('str')
    expect(Omitted.parse({ num: 42 })).toEqual({
        num: 42,
        bln: false,
        date: new Date('2024-01-01'),
    })
    // Pick
    const Picked = Primitives.pickSchema('Picked', { str: true })
    type Picked = z.infer<typeof Picked>
    expect(Picked.introspect().name).toBe('Picked')
    expect(Picked.introspect().schema).toHaveProperty('str')
    expect(Picked.introspect().schema).not.toHaveProperty('num')
    expect(Picked.parse({ str: 'World' })).toEqual({
        str: 'World',
    })
})

/* --- Nested Schemas -------------------------------------------------------------------------- */

test("Nested schemas work as expected", () => {
    const nestedMeta = Nested.introspect() as Meta$Schema
    // Nested Schemas
    expect(nestedMeta.schema?.user.zodType).toEqual('ZodObject')
    expect(nestedMeta.schema?.primitives.zodType).toEqual('ZodObject')
    expect(nestedMeta.schema?.advanced.zodType).toEqual('ZodObject')
    // Parsing Happy Paths
    expect(Nested.shape.user.parse({ name: 'John', age: 42 })).toEqual({ name: 'John', age: 42 })
    expect(Nested.shape.primitives.parse({ str: 'Hello', num: 42, bln: true, date: new Date('2020-01-01') })).toEqual({
        str: 'Hello',
        num: 42,
        bln: true,
        date: new Date('2020-01-01'),
    })
    expect(Nested.shape.advanced.parse({ enum: 'B', tuple: ['world', 24], union: 42, array: ['world'] })).toEqual({
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

/* --- Introspection flags --------------------------------------------------------------------- */

test("Calling .introspect(true) includes the correct zodStruct", () => {
    const nestedMeta = Nested.introspect(true) as Meta$Schema
    // Nested Schemas
    expect(nestedMeta.schema?.user.zodStruct).toEqual(User)
    expect(nestedMeta.schema?.primitives.zodStruct).toEqual(Primitives)
    expect(nestedMeta.schema?.advanced.zodStruct).toEqual(AdvancedTypes)
})

/* --- Documentation --------------------------------------------------------------------------- */

test('documentationProps() applies exampleValues over defaults in previewProps', () => {
    const WithDefaultsAndExamples = schema('WithDefaultsAndExamples', {
        name: z.string().default('unknown').example('Alice'),
        age: z.number().default(0).example(25),
    })
    const docProps = WithDefaultsAndExamples.documentationProps('TestComponent', {})
    expect(docProps.componentName).toBe('TestComponent')
    expect(docProps.propSchema).toBe(WithDefaultsAndExamples)
    expect(docProps.previewProps).toEqual({ name: 'Alice', age: 25 })
})
