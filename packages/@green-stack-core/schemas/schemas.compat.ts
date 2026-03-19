import type { ComponentProps, JSX, JSXElementConstructor } from 'react'
import type * as z3 from 'zod/v3'
import type * as z4 from 'zod/v4'
import type * as z4c from 'zod/v4/core'

/* --- Re-exports ------------------------------------------------------------------------------ */

export type { z3, z4c }

/* --- Constants ------------------------------------------------------------------------------- */

/** -i- Maps Zod type names to base/GraphQL-like types. Shared across v3 and v4. */
export const ZOD_TO_BASE = {
    // - Primitives -
    ZodString: 'String',
    ZodNumber: 'Number',
    ZodBoolean: 'Boolean',
    ZodDate: 'Date',
    // - Advanced & Objectlikes -
    ZodEnum: 'String',
    ZodArray: 'Array',
    ZodObject: 'Object',
    // - Mostly Supported, Experimental -
    ZodNull: 'Null', // Serialised as null
    ZodUndefined: 'Undefined', // Omitted unless combined
    ZodTuple: 'Any', // Serialised as JSON
    ZodUnion: 'Any', // Serialised as JSON
    ZodLiteral: 'Any', // We'll attempt to narrow down based on literal value, serialised as JSON as fallback
    ZodNativeEnum: 'Any', // Technically 'String' or 'Number', but we can't really know which one
    // - Might Work, Not Advised -
    ZodAny: 'Any', // Unpredictable, serialised as JSON
    ZodRecord: 'Object', // Cannot be used for GraphQL as we don't know the possible keys
    ZodUnknown: 'Any', // Serialised as JSON, can break if value is not JSON serializable
    ZodBigInt: 'Number', // Cannot be JSON serialized, use at own risk
    ZodSymbol: 'String', // Very experimental
    ZodIntersection: 'Any', // Unsure how to handle, will attempt to serialize as JSON
    ZodDiscriminatedUnion: 'Any', // Technically 'Object', unpredictable, serialised as JSON
    ZodMap: 'Any', // Technically 'Object', but JSON serialization is tricky
    ZodSet: 'Array', // Technically 'Array', but JSON serialization is tricky
    // - Unsupported, Avoid in Schemas -
    ZodVoid: 'Undefined', // Not sure when or where you'd use this outside of functions
    ZodFunction: 'Function', // Cannot be JSON serialized
    ZodPromise: 'Promise', // Cannot be JSON serialized
    ZodLazy: 'Any', // Unsure how to handle, attempted to serialize as JSON
    ZodEffects: 'Any', // Unsure how to handle, attempted to serialize as JSON
} as const

/** -i- Maps Zod v4 _zod.def.type strings to unified ZOD_TYPE names for version-agnostic Metadata */
export const V4_TYPE_TO_ZOD_TYPE: Record<string, ZOD_TYPE> = {
	string: 'ZodString',
	number: 'ZodNumber',
	int: 'ZodNumber',
	nan: 'ZodNumber',
	boolean: 'ZodBoolean',
	date: 'ZodDate',
	object: 'ZodObject',
	array: 'ZodArray',
	enum: 'ZodEnum',
	literal: 'ZodLiteral',
	union: 'ZodUnion',
	intersection: 'ZodIntersection',
	tuple: 'ZodTuple',
	record: 'ZodRecord',
	map: 'ZodMap',
	set: 'ZodSet',
	null: 'ZodNull',
	undefined: 'ZodUndefined',
	void: 'ZodVoid',
	any: 'ZodAny',
	unknown: 'ZodUnknown',
	bigint: 'ZodBigInt',
	symbol: 'ZodSymbol',
	lazy: 'ZodLazy',
	promise: 'ZodPromise',
	file: 'ZodAny',
	transform: 'ZodEffects',
	custom: 'ZodAny',
	template_literal: 'ZodString',
	readonly: 'ZodArray',
	success: 'ZodAny',
	nonoptional: 'ZodAny',
	pipe: 'ZodEffects',
	catch: 'ZodAny',
	prefault: 'ZodDefault' as any,
	default: 'ZodDefault' as any,
	optional: 'ZodOptional' as any,
	nullable: 'ZodNullable' as any,
}

/* --- Types ----------------------------------------------------------------------------------- */

/** -i- Zod v3 object schema or wrapped with optional/nullable/default */
type Z3ObjectSchemaLike =
  | z3.ZodObject<z3.ZodRawShape>
  | z3.ZodOptional<Z3ObjectSchemaLike>
  | z3.ZodNullable<Z3ObjectSchemaLike>
  | z3.ZodDefault<Z3ObjectSchemaLike>

/** -i- Any object schema that getSchemaMetadata/applySchemaDefaults can process (v3 or v4). Use for functions that accept both. */
export type ObjectSchemaLike = Z3ObjectSchemaLike | { _zod: { input?: unknown; output?: unknown } }

/** -i- Any Zod V3 / V4 / Mini type/def */
export type AnyZodType = z3.ZodType | z4c.$ZodType
/** -i- Any Zod V3 / V4 / Mini Object Schema Shape (record of field definitions) */
export type AnyZodShape = z3.ZodRawShape | z4c.$ZodShape | Record<string, AnyZodType>
/** -i- Any Zod V3 / V4 / Mini Object Schema */
export type AnyZodSchema<S extends AnyZodShape = AnyZodShape> = S extends z4c.$ZodShape
    ? z4c.$ZodType<z4c.$ZodObject<S>>
    : S extends z3.ZodRawShape
    ? z3.ZodObject<S>
    : never

/** -i- Zod Classes / Type, @example 'ZodString' */
export type ZOD_TYPE = keyof typeof ZOD_TO_BASE
/** -i- Base Type, @example 'String' */
export type BASE_TYPE = (typeof ZOD_TO_BASE)[ZOD_TYPE]
/** -i- Schema Type, @example 'String' | 'ZodString' */
export type SCHEMA_TYPE = (ZOD_TYPE | BASE_TYPE) & {}

/** -i- Options for the `.applyDefaults()` method */
export type ApplyDefaultsOptions = {
	logErrors?: boolean
	stripUnknown?: boolean
	stripSensitive?: boolean
	applyExamples?: boolean
}

/** -i- Normalized parse issue shape - compatible with both Zod v3 and v4 error output */
export type ParsedIssue = { path: (string | number)[]; message: string }

/** -i- Normalized safeParse result for version-agnostic validation */
export type SafeParseInputResult<T> = {
    success: true;
    data: T
} | {
    success: false;
    error: { issues: ParsedIssue[] }
}

/* --- SchemaInput<T> -------------------------------------------------------------------------- */
/** -i- Extract the input type from a Zod 3 or Zod 4 schema */
export type SchemaInput<T> = T extends { _zod: { input?: any } }
    ? z4c.input<T>
    : T extends z3.ZodTypeAny
    ? z3.input<T>
    : never

/** --- SchemaOutput<T> ------------------------------------------------------------------------ */
/** -i- Extract the output type from a Zod 3 or Zod 4 schema */
export type SchemaOutput<T> = T extends { _zod: { output?: any } }
    ? z4c.output<T>
    : T extends z3.ZodTypeAny
    ? z3.output<T>
    : never

/** --- SchemaInfer<T> ------------------------------------------------------------------------- */
/** -i- Extract the inferred type from a Zod 3 or Zod 4 schema */
export type SchemaInfer<T> = T extends { _zod: { output?: any } }
    ? z4c.infer<T>
    : T extends z3.ZodTypeAny
    ? z3.infer<T>
    : never

/** --- SchemaShapeRaw<T> ---------------------------------------------------------------------- */
/** -i- Extract the raw shape of a Zod 3 or Zod 4 schema, does not take ZodOptional, ZodDefault, ZodNullable into account */
export type SchemaShapeRaw<T> = T extends { _zod: { def: { type: "object"; shape: infer S } } }
    ? S
    : T extends z3.ZodObject<infer S, any, any>
    ? S
    : never

/** --- HasSchemaShape<T> ---------------------------------------------------------------------- */
/** -i- Type helper to check if a Zod schema has a valid shape */
export type HasSchemaShape<T> = SchemaShapeRaw<T> extends never ? false : true

/** --- UnwrapObjectSchema<T> ------------------------------------------------------------------ */
/** Unwrap ZodOptional, ZodDefault, ZodNullable to get to the inner schema */
export type UnwrapObjectSchema<T> =
    T extends z3.ZodOptional<infer U> ? UnwrapObjectSchema<U>
    : T extends z3.ZodDefault<infer U> ? UnwrapObjectSchema<U>
    : T extends z3.ZodNullable<infer U> ? UnwrapObjectSchema<U>
    : T extends { _zod: { def: { type: "optional" | "nullable" | "default" | "prefault"; innerType: infer U } } }
    ? UnwrapObjectSchema<U>
    : T

/** --- SchemaShape<T> ------------------------------------------------------------------------- */
/** Extract the innermost ZodObject shape of a Zod V3 or Zod V4 schema that might be wrapped */
export type SchemaShape<T> = SchemaShapeRaw<UnwrapObjectSchema<T>>

/** --- Metadata<S> ---------------------------------------------------------------------------- */
/** -i- Introspected field/schema metadata. zodStruct/innerStruct use AnyZodType for v3+v4 compatibility. */
export type Metadata<S = Record<string, any$Unknown> | any$Unknown[]> = {
	zodType: ZOD_TYPE
	baseType: BASE_TYPE
	name?: string
	isOptional?: boolean
	isNullable?: boolean
	defaultValue?: any$Unknown
	exampleValue?: any$Unknown
	description?: string
	minLength?: number
	maxLength?: number
	exactLength?: number
	minValue?: number
	maxValue?: number
	isInt?: boolean
	isBase64?: boolean
	isEmail?: boolean
	isURL?: boolean
	isUUID?: boolean
	isDate?: boolean
	isDatetime?: boolean
	isTime?: boolean
	isIP?: boolean
	literalValue?: any$Unknown
	literalType?: 'string' | 'boolean' | 'number'
	literalBase?: BASE_TYPE
	schema?: S
    // The actual Zod objects, only included with .introspect(true)
	zodStruct?: AnyZodType // wrapped, outermost
	innerStruct?: AnyZodType // unwrapped, innermost
    // Mark as serverside only, strippable in API responses
	isSensitive?: boolean
    // Compatibility with other systems like databases & drivers
	isID?: boolean
	isIndex?: boolean
	isUnique?: boolean
	isSparse?: boolean
}

export type Meta$Schema = Metadata<Record<string, Metadata>>
export type Meta$Tuple = Metadata<Metadata[]>
export type Meta$Union = Metadata<Metadata[]>
export type Meta$Intersection = Metadata<{ left: Metadata; right: Metadata }>

export type StackedMeta = Metadata & { innerStruct?: AnyZodType; zodStruct?: AnyZodType }

/** --- PropsOf<C,Z> --------------------------------------------------------------------------- */
/** -i- Extract the props type from a Zod schema for a given component */
export type PropsOf<
	C extends keyof JSX.IntrinsicElements | JSXElementConstructor<any$Unknown>,
	Z extends AnyZodSchema
> = ComponentProps<C> & SchemaInput<Z>

/** --- DocumentationProps<T> ------------------------------------------------------------------ */
/** -i- Extract the documentation props type from a Zod schema for a given component */
export type DocumentationProps<T extends Record<string, any$Unknown> = Record<string, any$Unknown>> = {
	componentName: string
	propSchema: AnyZodSchema
	propMeta: Record<string, Meta$Schema>
	previewProps: Record<string, any$Unknown>
	valueProp?: keyof T | HintedKeys
	onChangeProp?: keyof T | HintedKeys
	exampleProps?: Partial<T>
	previewState?: {
		didMount?: boolean
		didApplyParams?: boolean
		didRegister?: boolean
	}
}

/** --- isZod3Def() ---------------------------------------------------------------------------- */
/** -i- Check if a Zod type/def is a Zod V3 type/def */
export const isZod3Def = (schema: any$RefinedLater): schema is z3.ZodType => {
    return !!schema?._def && !schema?._zod
}

/** --- isZod4Def() ---------------------------------------------------------------------------- */
/** -i- Check if a Zod type/def is a Zod V4 type/def */
export const isZod4Def = (schema: any$RefinedLater): schema is z4c.$ZodType => {
    return !!schema?._zod?.def
}

/** --- isZod3Schema() ------------------------------------------------------------------------- */
/** -i- Check if a Zod schema was made with Zod v3 */
export const isZod3Schema = (schema: any$RefinedLater): schema is z3.ZodObject<z3.ZodRawShape> => {
    // @ts-ignore
    return isZod3Def(schema) && schema?._def?.typeName === 'ZodObject'
}

/** --- isZod4Schema() ------------------------------------------------------------------------- */
/** -i- Check if a Zod schema was made with Zod v4 */
export const isZod4Schema = (schema: any$RefinedLater): schema is z4c.$ZodType<z4.ZodObject> => {
    return isZod4Def(schema) && schema?._zod?.def?.type === 'object'
}

/** --- parseInput() --------------------------------------------------------------------------- */
/** -i- Universally parse input against a Zod v3 or v4 object schema. Throws on invalid input. */
export const parseInput = <S extends ObjectSchemaLike, T = SchemaInput<S>>(
    schema: S,
    values: unknown
): T => {
    if (isZod3Schema(schema)) return (schema as z3.ZodObject<z3.ZodRawShape>).parse(values) as T
    if (isZod4Schema(schema)) return (schema as any$Ignore).parse(values) as T
    throw new Error('parseInput: schema must be a Zod v3 or v4 object schema')
}

/** --- safeParseInput() ----------------------------------------------------------------------- */
/** -i- Universally parse input against a Zod v3 or v4 object schema. Returns normalized result. */
export const safeParseInput = <S extends ObjectSchemaLike, T = SchemaInput<S>>(
    schema: S,
    values: unknown
): Prettify<SafeParseInputResult<T>> => {

    if (isZod3Schema(schema)) {
        const result = (schema as z3.ZodObject<z3.ZodRawShape>).safeParse(values)
        if (result.success) return { success: true, data: result.data as T }
        return {
            success: false,
            error: {
                issues: result.error.issues.map(issue => ({
                    path: [...issue.path],
                    message: issue.message,
                })),
            },
        }
    }

    if (isZod4Schema(schema)) {
        const result = (schema as any$Ignore).safeParse(values)
        if (result.success) return { success: true, data: result.data as T }
        return {
            success: false,
            error: {
                issues: result.error!.issues.map((issue: { path: readonly (string | number)[]; message: string }) => ({
                    path: [...issue.path],
                    message: issue.message,
                })),
            },
        }
    }

    throw new Error('safeParseInput: schema must be a Zod v3 or v4 object schema')
}

/** --- hasSchemaShape() ----------------------------------------------------------------------- */
/** -i- Get the shape of a Zod schema */
export const hasSchemaShape = <T, R = HasSchemaShape<T>>(schema: T): R extends true ? true : false => {
    return (isZod3Schema(schema) || isZod4Schema(schema)) as R extends true ? true : false
}

/** --- getUnwrappedSchema() ------------------------------------------------------------------- */
/** -i- Get the innermost ZodObject schema after unwrapping ZodOptional, ZodDefault, ZodNullable, ZodPrefault */
export const getUnwrappedSchema = <T = unknown>(schema: T): UnwrapObjectSchema<T> => {
    
    // Avoid undefined & null
    if (schema == null) return schema as UnwrapObjectSchema<T>

    // Zod 4 + Zod Mini -> _zod.def with type & innerType
    type Zod4WrappedDef = z4c.$ZodOptionalDef | z4c.$ZodNullableDef | z4c.$ZodDefaultDef | z4c.$ZodPrefaultDef
    const zod4Def = isZod4Def(schema) ? (schema?._zod?.def as Zod4WrappedDef) : undefined
    if (zod4Def && ['optional', 'nullable', 'default', 'prefault'].includes(zod4Def?.type)) {
        return getUnwrappedSchema(zod4Def.innerType) as UnwrapObjectSchema<T>
    }

    // Zod 3 -> _def.innerType for ZodOptional, ZodDefault, ZodNullable
    type Zod3WrappedDef = z3.ZodOptionalDef | z3.ZodDefaultDef | z3.ZodNullableDef
    const zod3Def = isZod3Def(schema) ? (schema?._def as Zod3WrappedDef) : undefined
    if (zod3Def && ['ZodOptional', 'ZodDefault', 'ZodNullable'].includes(zod3Def?.typeName)) {
        return getUnwrappedSchema(zod3Def.innerType) as UnwrapObjectSchema<T>
    }

    // Default to the schema itself
    return schema as UnwrapObjectSchema<T>
}

/** --- getSchemaShape() ----------------------------------------------------------------------- */
/** -i- Get the shape (record of field schemas) from any Zod object schema. Auto unwraps optional, nullable, default, prefault */
export const getSchemaShape = <T = unknown>(schema: T): SchemaShape<T> | undefined => {
    
    // Unwrap the schema first in case it's wrapped
    const unwrappedSchema = getUnwrappedSchema(schema)

    // Avoid faulty schemas
    if (unwrappedSchema == null) return undefined

    // Zod 3 -> .shape on ZodObject
    const zod3Shape = isZod3Schema(unwrappedSchema) ? (unwrappedSchema as z3.ZodObject<z3.ZodRawShape>).shape : undefined
    if (zod3Shape) return zod3Shape as SchemaShape<T>

    // Zod 4 -> ._zod.def.shape on ZodObject
    const zod4Shape = isZod4Schema(unwrappedSchema) ? (unwrappedSchema._zod.def as z4c.$ZodObjectDef).shape : undefined
    if (zod4Shape && !Array.isArray(zod4Shape)) return zod4Shape as SchemaShape<T>

    // Default to undefined
    return undefined
}

/** --- Introspect registry -------------------------------------------------------------------- */
/** -i- Dependency-injection registry for version-specific schema introspection. */

// -i- WHY IT EXISTS
// -i- -------------
// -i- schemas.compat.ts is the shared core imported by v3, v4, and mini. It cannot import
// -i- those modules back (would create circular deps: compat → v3 → compat). So compat
// -i- cannot directly call v3/v4/mini introspection code. Instead, version-specific
// -i- modules register their introspect functions at load time.

// -i- SCHEMA STRUCTURE DIFFERS PER VERSION
// -i- ------------------------------------
// -i- V3: uses _def, _def.typeName, .shape, etc.
// -i- V4: uses _zod.def, _zod.def.type, etc.
// -i- Mini: uses _zod.def with different structure (e.g. _zod.bag for metadata)
// -i- The compat layer only detects v3 vs v4; it does not know internal structure.

// -i- V3/V4 VS MINI: PROTOTYPE PATCHING
// -i- ---------------------------------
// -i- V3 and v4 patch ZodType.prototype with introspect when they load. schemas created
// -i- with v3 or v4 therefore have .introspect on them. Zod mini does NOT patch the
// -i- prototype; its schemas have no .introspect. The registry is the fallback for
// -i- schemas that lack .introspect (e.g. zod mini).

// -i- DISPATCH FLOW (getSchemaMetadata)
// -i- ---------------------------------
// -i- 1. If schema.introspect exists → call it (v3/v4 patched schemas).
// -i- 2. Else if v3 schema → use _introspectV3 (fallback).
// -i- 3. Else if v4/mini schema → use _introspectV4 (fallback; mini registers here).

// -i- WHO REGISTERS
// -i- -------------
// -i- schemas.mini.ts: registerIntrospectV4(introspect) — required; mini schemas have no .introspect.
// -i- schemas.v3/v4: schemas get .introspect via prototype patch; registry is fallback only.

type IntrospectFn = (schema: any, includeZodStruct?: boolean) => Metadata & Record<string, any>
let _introspectV3: IntrospectFn | null = null
let _introspectV4: IntrospectFn | null = null

export const registerIntrospectV3 = (fn: IntrospectFn) => { _introspectV3 = fn }
export const registerIntrospectV4 = (fn: IntrospectFn) => { _introspectV4 = fn }

/** --- getSchemaMetadata() -------------------------------------------------------------------- */
/** -i- Unified introspection for AnyZodSchema. Dispatches to v3 or v4 based on schema detection. */
export const getSchemaMetadata = (schema: any, includeZodStruct = false): Metadata & Record<string, any> => {
    if (schema == null) throw new Error('getSchemaMetadata: schema is null or undefined')
    if (isZod3Def(schema)) {
        if (schema.introspect) return schema.introspect(includeZodStruct)
        if (_introspectV3) return _introspectV3(schema, includeZodStruct)
        throw new Error('getSchemaMetadata: Zod v3 introspection not registered. Import from @green-stack/schemas or @green-stack/schemas/v3.')
    }
    if (isZod4Def(schema)) {
        if (schema.introspect) return schema.introspect(includeZodStruct)
        if (_introspectV4) return _introspectV4(schema, includeZodStruct)
        throw new Error('getSchemaMetadata: Zod v4/mini introspection not registered. Import from @green-stack/schemas/v4 or @green-stack/schemas/mini.')
    }
    throw new Error('getSchemaMetadata: Unknown schema type')
}

/** --- getFieldSchema() ----------------------------------------------------------------------- */
/** -i- Get the field schema for a key from an object schema. */
export function getFieldSchema<T, K extends keyof SchemaShape<T> & string>(schema: T, key: K): SchemaShape<T>[K] | undefined
export function getFieldSchema<T>(schema: T, key: string): AnyZodType | undefined
export function getFieldSchema(schema: unknown, key: string): AnyZodType | undefined {
    const shape = getSchemaShape(schema)
    return shape?.[key] as AnyZodType | undefined
}

/** --- applySchemaDefaults() ----------------------------------------------------------------- */
/** -i- Apply defaults to partial data. Works with v3, v4, mini. Uses schema.applyDefaults when available, else metadata-based fallback. */
export function applySchemaDefaults<T extends Record<string, any>>(
    schema: any,
    data: T,
    options: ApplyDefaultsOptions = {}
): T {

    // Options
    const { logErrors = false, stripUnknown = false, stripSensitive = false, applyExamples = false } = options
    
    // Guards
    if (schema == null) throw new Error('applySchemaDefaults: schema is null or undefined')
    if (typeof schema.applyDefaults === 'function') return schema.applyDefaults(data, options) as T

    // Fallback for schemas without applyDefaults (e.g. zod mini)
    const meta = getSchemaMetadata(schema, true) as Metadata & { schema?: Record<string, Metadata> }
    const schemaFields = meta.schema || {}
    const defaultValues = Object.keys(schemaFields).reduce((acc, key) => {
        const fieldMeta = schemaFields[key] as Metadata
        const defaultValue = applyExamples ? fieldMeta.exampleValue : fieldMeta.defaultValue
        return defaultValue !== undefined ? { ...acc, [key]: defaultValue } : acc
    }, {} as Record<string, any>)

    let values = { ...defaultValues, ...data } as Record<string, any>

    // Recurse into nested objects (apply defaults to nested schemas)
    Object.keys(schemaFields).forEach((key) => {
        const fieldMeta = schemaFields[key] as Metadata & { zodType?: string; zodStruct?: any }
        const isObject = fieldMeta.zodType === 'ZodObject'
        if (!isObject || values[key] == null) return
        const innerSchema = fieldMeta.zodStruct
        if (!innerSchema) return
        const oldData = typeof values[key] === 'object' && !Array.isArray(values[key]) ? values[key] : {}
        values[key] = applySchemaDefaults(innerSchema, oldData, options)
    })

    // Strip sensitive fields?
    if (stripSensitive) {
        Object.keys(schemaFields).forEach((key) => {
            const fieldMeta = schemaFields[key] as Metadata
            if (fieldMeta.isSensitive) delete values[key]
        })
    }

    // Strip unknown fields?
    if (stripUnknown) {
        const validKeys = Object.keys(schemaFields)
        values = Object.fromEntries(Object.entries(values).filter(([key]) => validKeys.includes(key)))
    }

    // Return
    return values as T
}
