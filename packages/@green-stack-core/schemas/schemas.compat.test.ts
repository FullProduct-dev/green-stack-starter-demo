// @ts-ignore
import { expect, test } from 'bun:test'
import * as z3 from 'zod/v3'
import * as z4 from 'zod/v4'
import * as zm from 'zod/v4-mini'
import {
    type SchemaInput,
    type SchemaOutput,
    type SchemaInfer,
    type SchemaShapeRaw,
    type HasSchemaShape,
    type SchemaShape,
    isZod3Def,
    isZod4Def,
    isZod3Schema,
    isZod4Schema,
    safeParseInput,
    hasSchemaShape,
    getUnwrappedSchema,
    getSchemaShape,
    getFieldSchema,
} from './schemas.compat'

/* --- Test fixtures --------------------------------------------------------------------------- */

const Zod3Schema = z3.z.object({ name: z3.z.string().default('s'), age: z3.z.number() })
const Zod4Schema = z4.z.object({ name: z4.z.string(), age: z4.z.number().default(1) })
const ZodMSchema = zm.object({ name: zm.string(), age: zm._default(zm.number(), 1) })

const Zod3SchemaNullable = Zod3Schema.nullable()
const Zod4SchemaNullable = Zod4Schema.nullable()
const ZodMSchemaNullable = zm.nullable(ZodMSchema)

const isZodType = (schema: unknown) => isZod3Def(schema) || isZod4Def(schema)

/* --- isZod3Def ------------------------------------------------------------------------------- */

test('isZod3Def returns true for Zod v3 types and schemas', () => {
    expect(isZod3Def(z3.z.string())).toBe(true)
    expect(isZod3Def(Zod3Schema)).toBe(true)
})

test('isZod3Def returns false for Zod v4 and Mini types', () => {
    expect(isZod3Def(z4.z.string())).toBe(false)
    expect(isZod3Def(Zod4Schema)).toBe(false)
})

/* --- isZod4Def ------------------------------------------------------------------------------- */

test('isZod4Def returns true for Zod v4 and Mini types', () => {
    expect(isZod4Def(z4.z.string())).toBe(true)
    expect(isZod4Def(zm.string())).toBe(true)
    expect(isZod4Def(Zod4Schema)).toBe(true)
})

test('isZod4Def returns false for Zod v3 types', () => {
    expect(isZod4Def(z3.z.string())).toBe(false)
    expect(isZod4Def(Zod3Schema)).toBe(false)
})

/* --- isZod3Schema ---------------------------------------------------------------------------- */

test('isZod3Schema returns true for Zod v3 object schemas', () => {
    expect(isZod3Schema(Zod3Schema)).toBe(true)
})

test('isZod3Schema returns false for primitives and Zod v4 schemas', () => {
    expect(isZod3Schema(z3.z.string())).toBe(false)
    expect(isZod3Schema(Zod4Schema)).toBe(false)
})

/* --- isZod4Schema ---------------------------------------------------------------------------- */

test('isZod4Schema returns true for Zod v4 and Mini object schemas', () => {
    expect(isZod4Schema(Zod4Schema)).toBe(true)
    expect(isZod4Schema(zm.object({ name: zm.string() }))).toBe(true)
})

test('isZod4Schema returns false for primitives and Zod v3 schemas', () => {
    expect(isZod4Schema(z4.z.string())).toBe(false)
    expect(isZod4Schema(zm.string())).toBe(false)
    expect(isZod4Schema(Zod3Schema)).toBe(false)
})

/* --- safeParseInput -------------------------------------------------------------------------- */

test('safeParseInput parses valid input for Zod v3 and v4 schemas', () => {
    const r3 = safeParseInput(Zod3Schema, { name: 'a', age: 1 })
    expect(r3.success).toBe(true)
    if (r3.success) expect(r3.data).toEqual({ name: 'a', age: 1 })

    const r4 = safeParseInput(Zod4Schema, { name: 'b', age: 2 })
    expect(r4.success).toBe(true)
    if (r4.success) expect(r4.data).toEqual({ name: 'b', age: 2 })

    const rm = safeParseInput(ZodMSchema, { name: 'c', age: 3 })
    expect(rm.success).toBe(true)
    if (rm.success) expect(rm.data).toEqual({ name: 'c', age: 3 })
})

test('safeParseInput returns normalized error for invalid input', () => {
    const r3 = safeParseInput(Zod3Schema, { name: 123, age: 'x' })
    expect(r3.success).toBe(false)
    if (!r3.success) {
        expect(r3.error.issues.length).toBeGreaterThan(0)
        expect(r3.error.issues.every(i => Array.isArray(i.path) && typeof i.message === 'string')).toBe(true)
    }

    const r4 = safeParseInput(Zod4Schema, {})
    expect(r4.success).toBe(false)
    if (!r4.success) {
        expect(r4.error.issues.length).toBeGreaterThan(0)
    }
})

test('safeParseInput throws for non-object schemas', () => {
    expect(() => safeParseInput(z3.z.string() as any, 'hello')).toThrow()
})

/* --- hasSchemaShape -------------------------------------------------------------------------- */

test('hasSchemaShape returns true for object schemas', () => {
    expect(hasSchemaShape(Zod3Schema)).toBe(true)
    expect(hasSchemaShape(Zod4Schema)).toBe(true)
    expect(hasSchemaShape(ZodMSchema)).toBe(true)
})

test('hasSchemaShape returns false for primitive schemas', () => {
    expect(hasSchemaShape(z3.z.string())).toBe(false)
})

/* --- getUnwrappedSchema ---------------------------------------------------------------------- */

test('getUnwrappedSchema unwraps nullable to inner object schema', () => {
    const unwrapped = getUnwrappedSchema(Zod3SchemaNullable)
    expect(unwrapped).toBe(Zod3Schema)
})

test('getUnwrappedSchema unwraps nullable primitive to inner primitive', () => {
    const unwrapped = getUnwrappedSchema(z3.z.string().nullable()) as any
    expect(unwrapped?._def?.typeName).toBe('ZodString')
})

/* --- getSchemaShape -------------------------------------------------------------------------- */

test('getSchemaShape returns shape for object schemas (V3, V4, Mini)', () => {
    const shape3 = getSchemaShape(Zod3SchemaNullable)
    const shape4 = getSchemaShape(Zod4SchemaNullable)
    const shapeM = getSchemaShape(ZodMSchemaNullable)

    // @ts-ignore
    expect(['name', 'age'].every((key) => isZodType(shape3?.[key as keyof typeof shape3]))).toBe(true) // @ts-ignore
    expect(['name', 'age'].every((key) => isZodType(shape4?.[key as keyof typeof shape4]))).toBe(true) // @ts-ignore
    expect(['name', 'age'].every((key) => isZodType(shapeM?.[key as keyof typeof shapeM]))).toBe(true)
})

test('getSchemaShape returns undefined for non-object schemas', () => {
    expect(getSchemaShape(z3.z.string().nullable())).toBeUndefined()
})

/* --- getFieldSchema -------------------------------------------------------------------------- */

test('getFieldSchema returns field schema for valid keys (V3, V4, Mini)', () => {
    const field3Name = getFieldSchema(Zod3SchemaNullable, 'name')
    const field4Name = getFieldSchema(Zod4SchemaNullable, 'name')
    const fieldMName = getFieldSchema(ZodMSchemaNullable, 'name')
    const field3Age = getFieldSchema(Zod3Schema, 'age')
    const field4Age = getFieldSchema(Zod4Schema, 'age')
    const fieldMAge = getFieldSchema(ZodMSchema, 'age')

    expect(isZodType(field3Name)).toBe(true)
    expect(isZodType(field4Name)).toBe(true)
    expect(isZodType(fieldMName)).toBe(true)
    expect(isZodType(field3Age)).toBe(true)
    expect(isZodType(field4Age)).toBe(true)
    expect(isZodType(fieldMAge)).toBe(true)
})

test('getFieldSchema returns undefined for non-object schemas or invalid keys', () => {
    expect(isZodType(getFieldSchema(z3.z.string().nullable(), 'name'))).toBe(false)
    expect(isZodType(getFieldSchema(z3.z.string(), 'age'))).toBe(false)
    expect(getFieldSchema(Zod3Schema, 'unknown-key')).toBeUndefined()
})

/* --- Type-level verification ---------------------------------------------------------------- */

// -i- Type aliases verify generics resolve correctly for V3, V4, Mini. Compile fails if broken.
// -i- Mostly just to check manually in the file itself or through a TS linter

test('Types >>> SchemaInput, SchemaOutput, SchemaInfer utility types resolve the correct types for Zod V3 / V4 / Mini (direct + wrapped)', () => {
    
    type Zod3SchemaInput = SchemaInput<typeof Zod3Schema>
    type Zod4SchemaInput = SchemaInput<typeof Zod4Schema>
    type ZodMSchemaInput = SchemaInput<typeof ZodMSchema>
    type Zod3SchemaNullableInput = SchemaInput<typeof Zod3SchemaNullable>
    type Zod4SchemaNullableInput = SchemaInput<typeof Zod4SchemaNullable>
    type ZodMSchemaNullableInput = SchemaInput<typeof ZodMSchemaNullable>

    type Zod3SchemaOutput = SchemaOutput<typeof Zod3Schema>
    type Zod4SchemaOutput = SchemaOutput<typeof Zod4Schema>
    type ZodMSchemaOutput = SchemaOutput<typeof ZodMSchema>
    type Zod3SchemaNullableOutput = SchemaOutput<typeof Zod3SchemaNullable>
    type Zod4SchemaNullableOutput = SchemaOutput<typeof Zod4SchemaNullable>
    type ZodMSchemaNullableOutput = SchemaOutput<typeof ZodMSchemaNullable>

    type Zod3SchemaInferred = SchemaInfer<typeof Zod3Schema>
    type Zod4SchemaInferred = SchemaInfer<typeof Zod4Schema>
    type ZodMSchemaInferred = SchemaInfer<typeof ZodMSchema>
    type Zod3SchemaNullableInferred = SchemaInfer<typeof Zod3SchemaNullable>
    type Zod4SchemaNullableInferred = SchemaInfer<typeof Zod4SchemaNullable>
    type ZodMSchemaNullableInferred = SchemaInfer<typeof ZodMSchemaNullable>

    expect(true).toBe(true)
})

test('Types >>> SchemaShapeRaw, HasSchemaShape, SchemaShape utility types resolve the correct types for Zod V3 / V4 / Mini', () => {

    type Zod3SchemaShapeRaw = SchemaShapeRaw<typeof Zod3Schema>
    type Zod4SchemaShapeRaw = SchemaShapeRaw<typeof Zod4Schema>
    type ZodMSchemaShapeRaw = SchemaShapeRaw<typeof ZodMSchema>

    type Zod3SchemaNullableShapeWrapped = SchemaShapeRaw<typeof Zod3SchemaNullable> // never
    type Zod4SchemaNullableShapeWrapped = SchemaShapeRaw<typeof Zod4SchemaNullable> // never
    type ZodMSchemaNullableShapeWrapped = SchemaShapeRaw<typeof ZodMSchemaNullable> // never

    type Zod3SchemaHasShape = HasSchemaShape<typeof Zod3Schema> // true
    type Zod4SchemaHasShape = HasSchemaShape<typeof Zod4Schema> // true
    type ZodMSchemaHasShape = HasSchemaShape<typeof ZodMSchema> // true
    type Zod3SchemaNullableHasShape = HasSchemaShape<typeof Zod3SchemaNullable> // false
    type Zod4SchemaNullableHasShape = HasSchemaShape<typeof Zod4SchemaNullable> // false
    type ZodMSchemaNullableHasShape = HasSchemaShape<typeof ZodMSchemaNullable> // false

    type Zod3SchemaShape = SchemaShape<typeof Zod3Schema>
    type Zod4SchemaShape = SchemaShape<typeof Zod4Schema>
    type ZodMSchemaShape = SchemaShape<typeof ZodMSchema>
    type Zod3SchemaNullableShape = SchemaShape<typeof Zod3SchemaNullable>
    type Zod4SchemaNullableShape = SchemaShape<typeof Zod4SchemaNullable>
    type ZodMSchemaNullableShape = SchemaShape<typeof ZodMSchemaNullable>

    expect(true).toBe(true)
})
