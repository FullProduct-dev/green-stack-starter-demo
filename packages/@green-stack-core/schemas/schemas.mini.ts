// -i- Zod Mini module extension.
// -i- Re-exports zod/v4-mini + compat + functional wrapper helpers.
import * as zm from 'zod/v4-mini'
import * as z4c from 'zod/v4/core'
import type { Metadata, Meta$Schema, StackedMeta, ZOD_TYPE, SchemaInput, ApplyDefaultsOptions, SchemaOutput } from './schemas.compat'
import { ZOD_TO_BASE, V4_TYPE_TO_ZOD_TYPE, registerIntrospectV4 } from './schemas.compat'

/* --- Re-exports ------------------------------------------------------------------------------ */

export * from './schemas.compat'
export * from 'zod/v4-mini'

/* --- Types ----------------------------------------------------------------------------------- */

type V4Def = z4c.$ZodTypeDef & {
	innerType?: z4c.$ZodType
	shape?: Record<string, z4c.$ZodType>
	element?: z4c.$ZodType
	options?: readonly z4c.$ZodType[]
	items?: readonly z4c.$ZodType[]
	rest?: z4c.$ZodType | null
	entries?: Record<string, string | number>
	values?: unknown[]
	keyType?: z4c.$ZodType
	valueType?: z4c.$ZodType
	left?: z4c.$ZodType
	right?: z4c.$ZodType
	defaultValue?: unknown
	checks?: Array<{ check: string; format?: string; minimum?: number; maximum?: number; value?: number; inclusive?: boolean }>
}

type IntrospectFn = (s: any, includeZodStruct?: boolean, seen?: WeakSet<object>) => Metadata & Record<string, any>

/** --- addMeta() ------------------------------------------------------------------------------ */
/** -i- Adds introspectable metadata to a schema. Retrieve the full metadata with introspect() */
export function addMeta<T extends { _zod: { bag?: Record<string, unknown> } }>(schema: T, meta: Record<string, unknown>): T {
	const cloned = zm.clone(schema as any) as unknown as T
	cloned._zod.bag = { ...(cloned._zod.bag || {}), ...meta }
	return cloned
}

/** --- example() ----------------------------------------------------------------------------- */
/** -i- Adds an example value to a field. Handy for docgen through e.g. exampleProps() */
export function example<T extends { _zod: { bag?: Record<string, unknown> } }>(schema: T, value: unknown): T {
	return addMeta(schema, { exampleValue: value })
}

/** --- sensitive() --------------------------------------------------------------------------- */
/** -i- Marks a field as sensitive so it can be stripped when sent to the frontend or in docgen */
export function sensitive<T extends { _zod: { bag?: Record<string, unknown> } }>(schema: T): T {
	return addMeta(schema, { isSensitive: true })
}

/** --- index() ------------------------------------------------------------------------------- */
/** -i- Marks a schema as indexable. Useful for database indexes. */
export function index<T extends { _zod: { bag?: Record<string, unknown> } }>(schema: T): T {
	return addMeta(schema, { isIndex: true })
}

/** --- unique() ------------------------------------------------------------------------------- */
/** -i- Marks a schema as unique and indexable. Useful for database unique indexes. */
export function unique<T extends { _zod: { bag?: Record<string, unknown> } }>(schema: T): T {
	return addMeta(schema, { isUnique: true, isIndex: true })
}

/** --- sparse() ------------------------------------------------------------------------------- */
/** -i- Marks a schema as sparse and indexable. Useful for database sparse indexes. */
export function sparse<T extends { _zod: { bag?: Record<string, unknown> } }>(schema: T): T {
	return addMeta(schema, { isSparse: true, isIndex: true })
}

/** --- getStackedMetaMini() ------------------------------------------------------------------- */
/** -i- Recursively introspect a schema and return a flattened metadata object. */
function getStackedMetaMini(
	zodStruct: any,
	stackedMeta: StackedMeta[],
	includeZodStruct: boolean,
	introspectFn: IntrospectFn,
	seen: WeakSet<object> = new WeakSet()
): StackedMeta[] {

	// Cycle detection: avoid infinite recursion on self-referential schemas
	if (zodStruct && typeof zodStruct === 'object' && seen.has(zodStruct)) return stackedMeta
	if (zodStruct && typeof zodStruct === 'object') seen.add(zodStruct)

    // Extract the Zod v4 definition
	const _zod = zodStruct?._zod
	if (!_zod?.def) return stackedMeta
	const def = _zod.def as V4Def

    // Start with the actual metadata in bag
	const bag = _zod.bag || {}
    const metadata = (zodStruct.meta?.() || {}) as Record<string, any$Unknown>
	const meta: Record<string, any> = { ...metadata, ...bag }

    // Include the zod schema struct in the stack, we'll remove it again later
	meta.zodStruct = zodStruct
	const v4Type = def.type
	const zodType = V4_TYPE_TO_ZOD_TYPE[v4Type] || ('ZodAny' as ZOD_TYPE)

    // Unwrap optional, nullable, default & prefault
	if (['optional', 'nullable', 'default', 'prefault'].includes(v4Type)) {
		if (v4Type === 'optional' || v4Type === 'default' || v4Type === 'prefault') meta.isOptional = true
		if (v4Type === 'nullable') meta.isNullable = true
		if ((v4Type === 'default' || v4Type === 'prefault') && def.defaultValue !== undefined) {
			let dv = typeof def.defaultValue === 'function' ? def.defaultValue() : def.defaultValue
			if (dv instanceof Set) dv = Array.from(dv)
			if (dv instanceof Map) dv = Object.fromEntries(dv)
			meta.defaultValue = dv
		}
		const inner = def.innerType
		if (inner) return getStackedMetaMini(inner, [...stackedMeta, meta as StackedMeta], includeZodStruct, introspectFn, seen)
		return [...stackedMeta, meta as StackedMeta]
	}

    // Add string specific metadata
	if (v4Type === 'string' && def.checks) {
		for (const c of def.checks) {
			if (c.check === 'min_length' && c.minimum != null) meta.minLength = c.minimum
			if (c.check === 'max_length' && c.maximum != null) meta.maxLength = c.maximum
			if (c.check === 'length_equals' && (c as any).length != null) meta.exactLength = (c as any).length
			if (c.check === 'string_format' && c.format) {
				const f = c.format
				if (f === 'email') meta.isEmail = true
				if (f === 'url') meta.isURL = true
				if (f === 'uuid' || f === 'guid') meta.isUUID = meta.isID = true
				if (f === 'base64' || f === 'base64url') meta.isBase64 = true
				if (f === 'date') meta.isDate = true
				if (f === 'datetime') meta.isDatetime = true
				if (f === 'time') meta.isTime = true
				if (f === 'ipv4' || f === 'ipv6') meta.isIP = true
			}
		}
	}

    // Add number specific metadata
	if ((v4Type === 'number' || v4Type === 'int') && def.checks) {
		for (const c of def.checks) {
			if (c.check === 'greater_than' && c.value != null) meta.minValue = c.inclusive ? c.value : (c.value as number) + 1
			if (c.check === 'less_than' && c.value != null) meta.maxValue = c.inclusive ? c.value : (c.value as number) - 1
		}
		if (v4Type === 'int') meta.isInt = true
	}

    // Add literal specific metadata
	if (v4Type === 'literal' && def.values?.length) {
		const literalValue = def.values[0]
		meta.literalValue = literalValue
		meta.literalType = typeof literalValue
		if (typeof literalValue === 'string') meta.baseType = meta.literalBase = 'String'
		else if (typeof literalValue === 'number') meta.baseType = meta.literalBase = 'Number'
		else if (typeof literalValue === 'boolean') meta.baseType = meta.literalBase = 'Boolean'
	}

    // Add enum specific metadata
	if (v4Type === 'enum' && def.entries) meta.schema = def.entries

    // Add tuple specific metadata
	if (v4Type === 'tuple' && def.items) {
		meta.schema = def.items.map((item: any) => introspectFn(item, includeZodStruct, seen)).filter(Boolean)
	}

    // Add union specific metadata
	if (v4Type === 'union' && def.options) {
		meta.schema = def.options.map((opt: any) => introspectFn(opt, includeZodStruct, seen)).filter(Boolean)
	}

    // Add intersection specific metadata
	if (v4Type === 'intersection' && def.left && def.right) {
		meta.schema = { left: introspectFn(def.left, includeZodStruct, seen), right: introspectFn(def.right, includeZodStruct, seen) }
	}

    // Add array specific metadata
	if (v4Type === 'array' && def.element) {
		meta.schema = introspectFn(def.element, includeZodStruct, seen)
	}

    // Add object specific metadata
	if (v4Type === 'object' && def.shape) {
		meta.schema = Object.entries(def.shape).reduce(
			(acc: any, [key, fieldType]: [string, any]) => ({
				...acc,
				[key]: introspectFn(fieldType, includeZodStruct, seen),
			}),
			{}
		)
	}

    // Add record specific metadata
	if (v4Type === 'record' && def.valueType) {
		meta.schema = introspectFn(def.valueType, includeZodStruct, seen)
	}

    // Add set specific metadata
	if (v4Type === 'set' && def.valueType) {
		meta.schema = introspectFn(def.valueType, includeZodStruct, seen)
	}

    // Add map specific metadata
	if (v4Type === 'map' && def.keyType && def.valueType) {
		meta.schema = {
			key: introspectFn(def.keyType, includeZodStruct, seen),
			value: introspectFn(def.valueType, includeZodStruct, seen),
		}
	}

    // Include the original Zod v4 schema in the metadata?
	if (includeZodStruct) meta.innerStruct = zodStruct

    // Return the current metadata stack
	return [...stackedMeta, meta as StackedMeta]
}

/** --- introspect() --------------------------------------------------------------------------- */
/** -i- Introspects a schema and returns its metadata. */
export function introspect(schema: any, includeZodStruct = false, _seen?: WeakSet<object>): Meta$Schema & Record<string, any> {
	const seen = _seen ?? new WeakSet<object>()
	const introspectFn: IntrospectFn = (s, inc, s2) => introspect(s, inc ?? includeZodStruct, s2 ?? seen)
	const stackedMeta = getStackedMetaMini(schema, [], includeZodStruct, introspectFn, seen)
	const reversedMeta = [...stackedMeta].reverse()
	const [innermostMeta] = reversedMeta
	const zodType = (innermostMeta?.zodStruct ? V4_TYPE_TO_ZOD_TYPE[(innermostMeta.zodStruct as any)?._zod?.def?.type] : null) || ('ZodAny' as ZOD_TYPE)
	const baseType = ZOD_TO_BASE[zodType as keyof typeof ZOD_TO_BASE]
	const flatMeta = reversedMeta.reduce(
		(acc, { zodStruct, ...meta }) => ({
			...acc,
			...meta,
			...(includeZodStruct ? { zodStruct } : {}),
		}),
		{} as any
	)
	const meta = { ...flatMeta, zodType, baseType }
	if (meta.literalBase) meta.baseType = meta.literalBase
	return meta
}

/** --- applyDefaults() ------------------------------------------------------------------------ */
/** -i- Apply defaults to partial data. Self-contained to avoid recursion with compat's applySchemaDefaults. */
export function applyDefaults<
    Schema extends z4c.$ZodObject,
    Data extends Partial<SchemaInput<Schema>> & Record<string, any$Unknown>,
>(
    schema: Schema,
    data: Data,
    options: ApplyDefaultsOptions = {}
): Prettify<Data & SchemaOutput<Schema>> {

    // Options
    const { logErrors = false, stripUnknown = false, stripSensitive = false, applyExamples = false } = options

    // Parse input (mini schemas have .safeParse from zod)
    const result = (schema as any).safeParse?.(data)
    const introSpectionResult = introspect(schema, stripSensitive)
    const schemaFields = (introSpectionResult.schema as Record<string, Metadata>) || {}

    // Build default values from introspection
    const defaultValues = Object.keys(schemaFields).reduce((acc, key) => {
        const fieldMeta = schemaFields[key] as Metadata
        const defaultValue = applyExamples ? fieldMeta.exampleValue : fieldMeta.defaultValue
        const hasDefault = defaultValue !== undefined
        return hasDefault ? { ...acc, [key]: defaultValue } : acc
    }, {} as Record<string, any>)

    let values = {
        ...defaultValues,
        ...data,
        ...(!applyExamples && result?.data ? result.data : {}),
    } as Record<string, any>

    // Recurse into nested objects (mirrors v4 behavior)
    if (stripSensitive || stripUnknown) {
        Object.keys(schemaFields).forEach((key) => {
            const fieldMeta = schemaFields[key] as Metadata & { zodType?: string; zodStruct?: any; innerStruct?: any }
            const isObject = fieldMeta.zodType === 'ZodObject'
            if (!data[key] || !isObject) return
            const innerSchema = fieldMeta.zodStruct ?? fieldMeta.innerStruct
            if (!innerSchema) return
            const oldData = typeof values[key] === 'object' && !Array.isArray(values[key]) ? values[key] : {}
            values[key] = applyDefaults(innerSchema, oldData, options)
        })
    } else {
        Object.keys(schemaFields).forEach((key) => {
            const fieldMeta = schemaFields[key] as Metadata & { zodType?: string; zodStruct?: any; innerStruct?: any }
            const isObject = fieldMeta.zodType === 'ZodObject'
            if (!values[key] || !isObject) return
            const innerSchema = fieldMeta.zodStruct ?? fieldMeta.innerStruct
            if (!innerSchema) return
            const oldData = typeof values[key] === 'object' && !Array.isArray(values[key]) ? values[key] : {}
            values[key] = applyDefaults(innerSchema, oldData, options)
        })
    }

    // Strip sensitive fields
    if (stripSensitive) {
        Object.keys(schemaFields).forEach((key) => {
            const fieldMeta = schemaFields[key] as Metadata
            if (fieldMeta.isSensitive) delete values[key]
        })
    }

    if (!result?.success && logErrors) console.warn(JSON.stringify(result?.error, null, 2))

    // Strip unknown fields
    if (stripUnknown) {
        const validKeys = Object.keys(schemaFields)
        values = Object.fromEntries(Object.entries(values).filter(([key]) => validKeys.includes(key)))
    }

    return values as Prettify<Data & SchemaOutput<Schema>>
}

/** --- documentationProps() ------------------------------------------------------------------- */
/** -i- Returns the documentation props for a schema. */
export function documentationProps<
    Shape extends z4c.$ZodShape,
    Schema extends z4c.$ZodObject<Shape> = z4c.$ZodObject<Shape>,
>(schema: Schema, componentName: string, config: any = {}) {
    return {
        ...config,
        componentName,
        propSchema: schema,
        propMeta: introspect(schema, true).schema,
        previewProps: applyDefaults(schema, config.exampleProps || {}, { applyExamples: true }),
    }
}

/** --- nameSchema() --------------------------------------------------------------------------- */
/** -i- Add a name and introspection capabilities to a schema. */
export function nameSchema<
    Shape extends z4c.$ZodShape,
    Schema extends z4c.$ZodObject<Shape> = z4c.$ZodObject<Shape>,
    Input extends SchemaInput<Schema> = SchemaInput<Schema>,
    Data extends Partial<Input> & Record<string, any$Unknown> = Partial<Input> & Record<string, any$Unknown>,
>(name: string, schema: Schema) {
    const schemaWithMeta = addMeta(schema, { name })
    return Object.assign(schemaWithMeta, {
        introspect: (includeZodStruct = false) => introspect(schemaWithMeta, includeZodStruct),
        applyDefaults: (data: Data, options: ApplyDefaultsOptions = {}) => applyDefaults(schemaWithMeta, data, options),
        documentationProps: (componentName: string, config: any = {}) => documentationProps(schemaWithMeta, componentName, config),
    })
}

/** --- extendSchema() ------------------------------------------------------------------------- */
/** -i- Extend an object schema with new fields. Uses zm.extend(base, shape) under the hood. */
export function extendSchema<
    Shape extends z4c.$ZodShape = z4c.$ZodShape,
    Schema extends z4c.$ZodObject<Shape> = z4c.$ZodObject<Shape>,
    NewShape extends z4c.$ZodShape = z4c.$ZodShape,
    ZMSchema extends zm.ZodMiniObject<Shape> = zm.ZodMiniObject<Shape>,
>(
    baseSchema: Schema,
    name: string,
    newShape: NewShape,
) {
	return nameSchema(name, zm.extend(baseSchema as unknown as ZMSchema, newShape))
}

/** --- pickSchema() --------------------------------------------------------------------------- */
/** -i- Pick only specified keys from an object schema. Uses zm.pick(base, mask). Mask: { key: true, ... } */
export function pickSchema<
    Shape extends z4c.$ZodShape,
    Schema extends z4c.$ZodObject<Shape> = z4c.$ZodObject<Shape>,
    Mask extends Record<string, true> = Record<string, true>,
    ZMSchema extends zm.ZodMiniObject<Shape> = zm.ZodMiniObject<Shape>,
>(baseSchema: Schema, name: string, mask: Mask) {
	return nameSchema(name, zm.pick(baseSchema as unknown as ZMSchema, mask))
}

/** --- omitSchema() --------------------------------------------------------------------------- */
/** -i- Omit specified keys from an object schema. Uses zm.omit(base, mask). Mask: { key: true, ... } */
export function omitSchema<
    Shape extends z4c.$ZodShape,
    Schema extends z4c.$ZodObject<Shape> = z4c.$ZodObject<Shape>,
    Mask extends Record<string, true> = Record<string, true>,
    ZMSchema extends zm.ZodMiniObject<Shape> = zm.ZodMiniObject<Shape>,
>(baseSchema: Schema, name: string, mask: Mask) {
	return nameSchema(name, zm.omit(baseSchema as unknown as ZMSchema, mask))
}

/** --- schema() ------------------------------------------------------------------------------- */
/** -i- Similar to z.object(), but requires a name so it may serve as a single source of truth */
export function schema<
    Shape extends z4c.$ZodShape = z4c.$ZodShape,
>(name: string, shape: Shape) {
	return nameSchema(name, zm.object(shape))
}

/** --- inputOptions() ------------------------------------------------------------------------- */
/** -i- Creates an enum-like schema with entries. */
export function inputOptions<T extends Readonly<Record<string, string>>>(obj: T) {
	type K = Exclude<keyof T, number | symbol>
	const keys = Object.keys(obj) as [K, ...K[]]
	const zEnum = zm.enum(keys)
	const reassigned = Object.keys(obj).reduce((acc, key) => Object.assign(acc, { [key]: obj[key] }), zEnum)
	return Object.assign(reassigned, { entries: obj }) as typeof zEnum & { entries: T } & { [K in keyof T]: T[K] }
}

/* --- Wrapper augmentation -------------------------------------------------------------------- */
// -i- Ensures .introspect(), .applyDefaults(), .documentationProps() work on wrapped schemas. (nullable, optional, default, prefault)

// -i- Gets the inner schema of a wrapped schema.
const getInnerSchema = (schema: any) => schema?._zod?.def?.innerType

/** --- patchWrapperPrototype() ---------------------------------------------------------------- */
/** -i- Patches the prototype of a wrapper class to add .introspect(), .applyDefaults(), .documentationProps() */
function patchWrapperPrototype(WrapperClass: any) {
	if (!WrapperClass?.prototype || typeof WrapperClass.prototype.introspect === 'function') return
	WrapperClass.prototype.introspect = function (includeZodStruct = false) {
		return introspect(this, includeZodStruct)
	}
	WrapperClass.prototype.applyDefaults = function (data: any, options: ApplyDefaultsOptions = {}) {
		const inner = getInnerSchema(this)
		const def = this?._zod?.def as V4Def
		const v4Type = def?.type
		// Pass through null/undefined when that's the valid value for this wrapper
		if (v4Type === 'nullable' && data === null) return null
		if (v4Type === 'optional' && data === undefined) return undefined
		if ((v4Type === 'default' || v4Type === 'prefault') && data === undefined) {
			const dv = def?.defaultValue
			const defaultValue = typeof dv === 'function' ? dv() : dv
			if (inner && typeof (inner as any).applyDefaults === 'function' && defaultValue !== null && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
				return (inner as any).applyDefaults(defaultValue, options)
			}
			return defaultValue
		}
		return inner && typeof (inner as any).applyDefaults === 'function'
			? (inner as any).applyDefaults(data, options)
			: applyDefaults(this, data, options)
	}
	WrapperClass.prototype.documentationProps = function (componentName: string, config: any = {}) {
		const inner = getInnerSchema(this)
		return inner && typeof (inner as any).documentationProps === 'function'
			? (inner as any).documentationProps(componentName, config)
			: documentationProps(this, componentName, config)
	}
}

// -i- Obtain wrapper constructors via instantiation and patch them
const dummyObject = zm.object({ __dummy: zm.string() })
try {
	patchWrapperPrototype(zm.nullable(dummyObject).constructor)
	patchWrapperPrototype(zm.optional(dummyObject).constructor)
	patchWrapperPrototype(zm._default(dummyObject, { __dummy: '' }).constructor)
	if (typeof (zm as any).prefault === 'function') {
		patchWrapperPrototype((zm as any).prefault(dummyObject, { __dummy: '' }).constructor)
	}
} catch (_) {
	// Some wrappers may not exist; ignore
}

/* --- Module augmentation (zod/v4-mini wrapper types) ----------------------------------------- */
/** -i- Ensures wrapped schemas are typed with .introspect(), .applyDefaults(), .documentationProps()
 ** -i- Uses zod's SomeType to match original declarations; runtime patching provides the methods. */
declare module 'zod/v4-mini' {
    
	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- merged with zod's interfaces
	interface ZodMiniNullable<T extends z4c.SomeType = z4c.$ZodType> {
		introspect(includeZodStruct?: boolean): Meta$Schema & Record<string, any>
		applyDefaults<D extends Record<string, any>>(data: D, options?: ApplyDefaultsOptions): any
		documentationProps(componentName: string, config?: any): any
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- merged with zod's interfaces
	interface ZodMiniOptional<T extends z4c.SomeType = z4c.$ZodType> {
		introspect(includeZodStruct?: boolean): Meta$Schema & Record<string, any>
		applyDefaults<D extends Record<string, any>>(data: D, options?: ApplyDefaultsOptions): any
		documentationProps(componentName: string, config?: any): any
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- merged with zod's interfaces
	interface ZodMiniDefault<T extends z4c.SomeType = z4c.$ZodType> {
		introspect(includeZodStruct?: boolean): Meta$Schema & Record<string, any>
		applyDefaults<D extends Record<string, any>>(data: D, options?: ApplyDefaultsOptions): any
		documentationProps(componentName: string, config?: any): any
	}

	// eslint-disable-next-line @typescript-eslint/no-unused-vars -- merged with zod's interfaces
	interface ZodMiniPrefault<T extends z4c.SomeType = z4c.$ZodType> {
		introspect(includeZodStruct?: boolean): Meta$Schema & Record<string, any>
		applyDefaults<D extends Record<string, any>>(data: D, options?: ApplyDefaultsOptions): any
		documentationProps(componentName: string, config?: any): any
	}
}

/* --- Register for getSchemaMetadata ---------------------------------------------------------- */

registerIntrospectV4(introspect)
