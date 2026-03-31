// -i- Zod V4 module extension.
// -i- Import from zod/v4 and zod/v4/core. Re-exports compat + v4-specific extensions.
import { z, ZodType, ZodObject } from 'zod/v4'
import * as z4c from 'zod/v4/core'
import type { ApplyDefaultsOptions, Metadata, Meta$Schema, Meta$Tuple, Meta$Union, StackedMeta, ZOD_TYPE, AnyZodShape } from './schemas.compat'
import { ZOD_TO_BASE, V4_TYPE_TO_ZOD_TYPE, getSchemaShape, type SchemaInput, type SchemaOutput } from './schemas.compat'

/* --- Re-exports ------------------------------------------------------------------------------ */

export * from './schemas.compat'

/* --- ZOD_TO_DEF (v4 code-gen, same shape as v3) ---------------------------------------------- */

export const ZOD_TO_DEF = {
	ZodString: (fieldMeta: Metadata) => `.string()`,
	ZodNumber: (fieldMeta: Metadata) => `.number()`,
	ZodBoolean: (fieldMeta: Metadata) => `.boolean()`,
	ZodDate: (fieldMeta: Metadata) => `.date()`,
	ZodEnum: (fieldMeta: Metadata, innerDef = '...') => `.enum([${innerDef}])`,
	ZodArray: (fieldMeta: Metadata, innerDef = '...') => `.array(${innerDef})`,
	ZodObject: (fieldMeta: Metadata, innerDef = '...') => `.object({\n${innerDef}\n})`,
	ZodNull: (fieldMeta: Metadata) => `.null()`,
	ZodUndefined: (fieldMeta: Metadata) => `.undefined()`,
	ZodTuple: (fieldMeta: Metadata, innerDef = '..., ...') => `.tuple([${innerDef}])`,
	ZodUnion: (fieldMeta: Metadata, innerDef = '..., ...') => `.union([${innerDef}])`,
	ZodLiteral: (fieldMeta: Metadata, innerDef = '...') => `.literal(${innerDef})`,
	ZodNativeEnum: (fieldMeta: Metadata, innerDef = '...') => `.nativeEnum(${innerDef})`,
	ZodAny: (fieldMeta: Metadata) => `.any()`,
	ZodRecord: (fieldMeta: Metadata, innerDef = '...') => `.record(${innerDef})`,
	ZodUnknown: (fieldMeta: Metadata) => `.unknown()`,
	ZodBigInt: (fieldMeta: Metadata) => `.bigint()`,
	ZodSymbol: (fieldMeta: Metadata) => `.symbol()`,
	ZodIntersection: (fieldMeta: Metadata, innerDef = '...') => `.intersection(${innerDef})`,
	ZodDiscriminatedUnion: (fieldMeta: Metadata, innerDef = '...') => `.discriminatedUnion(${innerDef})`,
	ZodMap: (fieldMeta: Metadata, innerDef = '...') => `.map(${innerDef})`,
	ZodSet: (fieldMeta: Metadata, innerDef = '...') => `.set(${innerDef})`,
	ZodVoid: (fieldMeta: Metadata) => `.void()`,
	ZodFunction: (fieldMeta: Metadata) => `.function()`,
	ZodPromise: (fieldMeta: Metadata) => `.promise()`,
	ZodLazy: (fieldMeta: Metadata, innerDef = '...') => `.lazy(() => ${innerDef})`,
	ZodEffects: (fieldMeta: Metadata, innerDef = '...') => `.effects(() => ${innerDef})`,
} as const

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
	schema?: z4c.$ZodType
	steps?: readonly z4c.$ZodType[]
	defaultValue?: unknown
	format?: string
	checks?: Array<{
		check: string
		format?: string
		minimum?: number
		maximum?: number
		value?: number
		inclusive?: boolean
		[minMax: string]: unknown
	}>
}

/* --- Tests ----------------------------------------------------------------------------------- */

const Z4Schema = z.object({
    name: z.string(),
    age: z.number(),
})

type Z4Schema = z.infer<typeof Z4Schema>

const Z4Extended = Z4Schema.extend({
    email: z.email(),
})

type Z4Extended = z.infer<typeof Z4Extended>

/* --- Module augmentation (zod/v4/core) ------------------------------------------------------- */

declare module 'zod/v4/core' {

	interface $ZodType {
		metadata(): Record<string, any$Unknown>
		addMeta(meta: Record<string, any$Unknown>): this
		sensitive(): this
		index(): this
		unique(): this
		sparse(): this
		example<T>(exampleValue: T): this
		eg<T>(exampleValue: T): this
		ex<T>(exampleValue: T): this
		introspect(includeZodStruct?: boolean): Meta$Schema & Record<string, any>
	}

	interface $ZodObject< // @ts-ignore
        Shape extends Readonly<z.core.$ZodShape> = Readonly<z.core.$ZodShape>,
        Params extends z.core.$ZodObjectConfig = z.core.$ZodObjectConfig,
    > {

        name?: string

        // -- New methods --

		nameSchema(name: string): this

		extendSchema<S extends Readonly<z.core.$ZodShape>>(
            name: string,
            shape: S
        ): z.ZodObject<Shape & S, Params>

		pickSchema<Mask extends z.core.util.Exactly<{ [k in keyof Shape]?: true }, Mask>>(
            schemaName: string,
            mask: Mask
        ): z.ZodObject<Pick<Shape, Extract<keyof Shape, keyof Mask>>>

		omitSchema<Mask extends z.core.util.Exactly<{ [k in keyof Shape]?: true }, Mask>>(
            schemaName: string,
            mask: Mask
        ): z.ZodObject<Omit<Shape, keyof Mask>>

		applyDefaults<D extends Partial<SchemaInput<z.ZodObject<Shape, Params>>> & Record<string, any$Unknown>>(
            data: D,
            options?: ApplyDefaultsOptions
        ): Prettify<D & SchemaOutput<z.ZodObject<Shape, Params>>>

		documentationProps<
            Props extends SchemaInput<z.ZodObject<Shape, Params>> = SchemaInput<z.ZodObject<Shape, Params>>,
            Name extends string = string,
        >(
            componentName: Name,
            config?: Partial<{
                componentName?: string,
                propSchema?: any$Ignore,
                propMeta?: any$Ignore,
                previewProps?: any$Ignore,
                exampleProps?: Partial<Props>,
                valueProp?: keyof Props | HintedKeys,
                onChangeProp?: keyof Props | HintedKeys,
            }>
        ): {
            componentName: Name,
            propSchema: z.ZodObject<Shape, Params>,
            propMeta: Record<string, Meta$Schema>,
            previewProps: Partial<SchemaInput<z.ZodObject<Shape, Params>>>,
            valueProp?: keyof Props | HintedKeys,
            onChangeProp?: keyof Props | HintedKeys,
        }

        // -- Deprecations --

        /** @deprecated Use `.extendSchema('NewName', { ...shape })` instead */
        extend<S extends Readonly<z.core.$ZodShape>>(shape: S): z.ZodObject<Shape & S, Params>

        /** @deprecated Use `.extendSchema('NewName', { ...shape })` instead */
        safeExtend<S extends Readonly<z.core.$ZodShape>>(shape: S): z.ZodObject<Shape & S, Params>

        /** @deprecated Use `.pickSchema('NewName', { ...mask })` instead */
		pick<Mask extends z.core.util.Exactly<{ [k in keyof Shape]?: true }, Mask>>(
            mask: Mask
        ): z.ZodObject<Pick<Shape, Extract<keyof Shape, keyof Mask>>>

        /** @deprecated Use `.omitSchema('NewName', { ...mask })` instead */
		omit<Mask extends z.core.util.Exactly<{ [k in keyof Shape]?: true }, Mask>>(
            mask: Mask
        ): z.ZodObject<Omit<Shape, keyof Mask>>
	}
}

/** --- getStackedMetaV4() --------------------------------------------------------------------- */
/** -i- Recursively introspect a Zod v4 schema and return a flattened metadata object. */
function getStackedMetaV4<Z extends z4c.$ZodType>(
	zodStruct: Z,
	stackedMeta: StackedMeta[] = [],
	includeZodStruct = false
): StackedMeta[] {
    
    // Extract the Zod v4 definition
	const _zod = zodStruct._zod
	if (!_zod?.def) return stackedMeta
	const def = _zod.def as V4Def

    // Start with the actual metadata in bag
	const bag = _zod.bag || {} // @ts-ignore
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
		if (inner) return getStackedMetaV4(inner, [...stackedMeta, meta as StackedMeta], includeZodStruct)
		return [...stackedMeta, meta as StackedMeta]
	}

	// Unwrap pipe to reach inner schemas (zod v4 composes .min(), .max() etc. via pipe)
	if (v4Type === 'pipe') {
		const inner = (def as any).schema ?? (def as any).left ?? (def as any).steps?.[0]
		if (inner) return getStackedMetaV4(inner, [...stackedMeta, meta as StackedMeta], includeZodStruct)
	}

	// String format from def itself (z.base64(), z.email() etc. store format on def)
	if (v4Type === 'string' && (def as any).format && (def as any).check === 'string_format') {
		const f = (def as any).format
		if (f === 'email') meta.isEmail = true
		if (f === 'url') meta.isURL = true
		if (f === 'uuid' || f === 'guid') meta.isUUID = meta.isID = true
		if (f === 'base64' || f === 'base64url') meta.isBase64 = true
		if (f === 'date' || f === 'iso_date') meta.isDate = true
		if (f === 'datetime' || f === 'iso_datetime') meta.isDatetime = true
		if (f === 'time' || f === 'iso_time') meta.isTime = true
		if (f === 'ipv4' || f === 'ipv6') meta.isIP = true
	}
	// String checks (min/max length) - v4 check values live in c._zod.def
	if (v4Type === 'string' && def.checks) {
		for (const c of def.checks) {
			const cd = (c as any)._zod?.def ?? c
			if (cd.check === 'min_length' && (cd.minimum ?? cd.value) != null) meta.minLength = cd.minimum ?? cd.value
			if (cd.check === 'max_length' && (cd.maximum ?? cd.value) != null) meta.maxLength = cd.maximum ?? cd.value
			if (cd.check === 'length_equals' && (cd as any).length != null) meta.exactLength = (cd as any).length
			if (cd.check === 'string_format' && cd.format) {
				const f = cd.format
				if (f === 'email') meta.isEmail = true
				if (f === 'url') meta.isURL = true
				if (f === 'uuid' || f === 'guid') meta.isUUID = meta.isID = true
				if (f === 'base64' || f === 'base64url') meta.isBase64 = true
				if (f === 'date' || f === 'iso_date') meta.isDate = true
				if (f === 'datetime' || f === 'iso_datetime') meta.isDatetime = true
				if (f === 'time' || f === 'iso_time') meta.isTime = true
				if (f === 'ipv4' || f === 'ipv6') meta.isIP = true
			}
		}
	}

	// Number checks - v4 check values live in c._zod.def
	if (v4Type === 'number' || v4Type === 'int' || zodType === 'ZodNumber') {
        if (def.checks) {
            for (const c of def.checks) {
                const cd = (c as any)._zod?.def ?? c
                if (cd.check === 'greater_than' && cd.value != null) meta.minValue = cd.inclusive ? cd.value : (cd.value as number) + 1
                if (cd.check === 'less_than' && cd.value != null) meta.maxValue = cd.inclusive ? cd.value : (cd.value as number) - 1
            }
        }
		if (def.format === 'safeint') meta.isInt = true
	}

	// Literal
	if (v4Type === 'literal' && def.values?.length) {
		const literalValue = def.values[0]
		meta.literalValue = literalValue
		meta.literalType = typeof literalValue
		if (typeof literalValue === 'string') meta.baseType = 'String'
		if (typeof literalValue === 'number') meta.baseType = 'Number'
		if (typeof literalValue === 'boolean') meta.baseType = 'Boolean'
		meta.literalBase = meta.baseType
	}

	// Enum
	if (v4Type === 'enum' && def.entries) {
		meta.schema = def.entries
	}

	// Tuple
	if (v4Type === 'tuple' && def.items) {
		const introspect = (s: any) => (s?.introspect ? s.introspect(includeZodStruct) : undefined)
		meta.schema = def.items.map((item: any) => introspect(item)).filter(Boolean)
	}

	// Union
	if (v4Type === 'union' && def.options) {
		const introspect = (s: any) => (s?.introspect ? s.introspect(includeZodStruct) : undefined)
		meta.schema = def.options.map((opt: any) => introspect(opt)).filter(Boolean)
	}

	// Intersection
	if (v4Type === 'intersection' && def.left && def.right) {
		const introspect = (s: any) => (s?.introspect ? s.introspect(includeZodStruct) : undefined)
		meta.schema = { left: introspect(def.left), right: introspect(def.right) }
	}

	// Array
	if (v4Type === 'array' && def.element) {
		const el = def.element as any
		meta.schema = el?.introspect ? el.introspect(includeZodStruct) : undefined
		if (def.checks) {
			for (const c of def.checks) {
				const cd = (c as any)._zod?.def ?? c
				if (cd.check === 'min_length' && (cd.minimum ?? cd.value) != null)
					meta.minLength = cd.minimum ?? cd.value
				if (cd.check === 'max_length' && (cd.maximum ?? cd.value) != null)
					meta.maxLength = cd.maximum ?? cd.value
			}
		}
	}

	// Object
	if (v4Type === 'object' && def.shape) {
		const introspect = (s: any) => (s?.introspect ? s.introspect(includeZodStruct) : undefined)
		meta.schema = Object.entries(def.shape).reduce(
			(acc: any, [key, fieldType]: [string, any]) => ({ ...acc, [key]: introspect(fieldType) }),
			{}
		)
	}

	// Record
	if (v4Type === 'record' && def.valueType) {
		const vt = def.valueType as any
		meta.schema = vt?.introspect ? vt.introspect(includeZodStruct) : undefined
	}

	// Set
	if (v4Type === 'set' && def.valueType) {
		const vt = def.valueType as any
		meta.schema = vt?.introspect ? vt.introspect(includeZodStruct) : undefined
	}

	// Map
	if (v4Type === 'map' && def.keyType && def.valueType) {
		const kt = def.keyType as any
		const vt = def.valueType as any
		meta.schema = {
			key: kt?.introspect ? kt.introspect(includeZodStruct) : undefined,
			value: vt?.introspect ? vt.introspect(includeZodStruct) : undefined,
		}
	}

    // Include the original Zod v4 schema in the metadata?
	if (includeZodStruct) meta.innerStruct = zodStruct

    // Return the current metadata stack
	const currentMetaStack = [...stackedMeta, meta as StackedMeta]
	return currentMetaStack
}

/** --- addMetaV4() ---------------------------------------------------------------------------- */
/** -i- Add metadata to a Zod v4 schema. */
export function addMetaV4<T extends z4c.$ZodType>(schema: T, meta: Record<string, unknown>): T {
	const cloned = z4c.clone(schema) as T // @ts-ignore
	cloned._zod.bag = { ...cloned._zod.bag, ...cloned.metadata?.(), ...meta }
	return cloned
}

/* --- Prototype patches ----------------------------------------------------------------------- */
// -i- Registers module extensions for Zod v4 if not already applied

if (ZodType && !ZodType.prototype.metadata) {

	ZodType.prototype.metadata = function () {
		return { ...this._zod.bag, ...this.meta?.() }
	}

	ZodType.prototype.addMeta = function (meta: Record<string, any$Unknown>) {
		return addMetaV4(this, meta)
	}

	ZodType.prototype.sensitive = function () {
		return this.addMeta({ isSensitive: true })
	}

	ZodType.prototype.index = function () {
		return this.addMeta({ isIndex: true })
	}

	ZodType.prototype.unique = function () {
		return this.addMeta({ isUnique: true, isIndex: true })
	}

	ZodType.prototype.sparse = function () {
		return this.addMeta({ isSparse: true, isIndex: true })
	}

	ZodType.prototype.example = function (exampleValue: any) {
		return this.addMeta({ exampleValue })
	}
	ZodType.prototype.eg = ZodType.prototype.example
	ZodType.prototype.ex = ZodType.prototype.example

	ZodType.prototype.introspect = function (includeZodStruct = false) {
		const stackedMeta = getStackedMetaV4(this, [], includeZodStruct)
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
}

if (ZodObject && !ZodObject.prototype.nameSchema) {

	ZodObject.prototype.nameSchema = function (name: string) {
		return this.addMeta({ name })
	}

	ZodObject.prototype.extendSchema = function (name: string, shape: any) {
		return this.extend(shape).nameSchema(name)
	}

	ZodObject.prototype.pickSchema = function (schemaName: string, picks: any) {
		return this.pick(picks).nameSchema(schemaName)
	}

	ZodObject.prototype.omitSchema = function (schemaName: string, picks: any) {
		return this.omit(picks).nameSchema(schemaName)
	}

	ZodObject.prototype.applyDefaults = function (data: any, options: ApplyDefaultsOptions = {}) {
		const { logErrors = false, stripUnknown = false, stripSensitive = false, applyExamples = false } = options
		const result = this.safeParse(data)
		const introSpectionResult = this.introspect(stripSensitive)
		const defaultValues = Object.keys(introSpectionResult.schema || {}).reduce((acc, key) => {
			const fieldMeta = (introSpectionResult.schema as any)![key] as Metadata
			const defaultValue = applyExamples ? fieldMeta.exampleValue : fieldMeta.defaultValue
			const hasDefault = defaultValue !== undefined
			return hasDefault ? { ...acc, [key]: defaultValue } : acc
		}, {} as Record<string, any>)
		const values = {
			...defaultValues,
			...data,
			...(!applyExamples ? result.data : {}),
		} as any
		if (stripSensitive || stripUnknown) {
			Object.keys(introSpectionResult.schema || {}).forEach((key) => {
				const fieldMeta = (introSpectionResult.schema as any)![key] as Metadata
				const isObject = (fieldMeta as any).zodType === 'ZodObject'
				if (!data[key] || !isObject) return
				const innerMeta = (fieldMeta as any).zodStruct?.introspect?.(true)
				if (!innerMeta) return
				const InnerSchema = innerMeta?.innerStruct
				if (!InnerSchema?.applyDefaults) return
				const oldData = { ...values[key] }
				const newData = InnerSchema.applyDefaults(oldData, options)
				values[key] = newData
			})
		}
		if (stripSensitive) {
			Object.keys(introSpectionResult.schema || {}).forEach((key) => {
				const fieldMeta = (introSpectionResult.schema as any)![key] as Metadata
				if (fieldMeta.isSensitive) delete values[key]
			})
		}
		if (!result.success && logErrors) console.warn(JSON.stringify(result.error, null, 2))
		if (stripUnknown) {
			const shape = getSchemaShape(this)
			const validKeys = shape ? Object.keys(shape) : []
			const validData = Object.fromEntries(Object.entries(values).filter(([key]) => validKeys.includes(key)))
			return { ...validData } as any
		}
		return values as any
	}

	ZodObject.prototype.documentationProps = function (componentName: string, config: any = {}) {
		return {
			...config,
			componentName,
			propSchema: this,
			propMeta: this.introspect().schema as Record<string, Meta$Schema>,
			previewProps: this.applyDefaults(config.exampleProps || {}, { applyExamples: true }),
		}
	}
}

/* --- schema() -------------------------------------------------------------------------------- */

export const schema = <S extends AnyZodShape>(name: string, shape: S) => {
	return z.object(shape).nameSchema(name)
}

/* --- inputOptions() -------------------------------------------------------------------------- */

export const inputOptions = <T extends Readonly<Record<string, string>>>(obj: T) => {
	type K = Exclude<keyof T, number | symbol>
	const keys = Object.keys(obj) as [K, ...K[]]
	const zEnum = z.enum(keys)
	const reassigned = Object.keys(obj).reduce((acc, key) => {
		return Object.assign(acc, { [key]: obj[key] })
	}, zEnum)
	return Object.assign(reassigned, { entries: obj }) as typeof zEnum & { entries: T } & {
		[K in keyof T]: T[K]
	}
}

/* --- renderFieldMetaToZodDefV4() ------------------------------------------------------------- */

export const renderFieldMetaToZodDefV4 = (fieldKey: string, fieldMeta: Metadata) => {

	const { zodType } = fieldMeta

	const getBaseDef = (key: ZOD_TYPE) => ZOD_TO_DEF[key as keyof typeof ZOD_TO_DEF]
	const toBaseDef = getBaseDef(zodType as ZOD_TYPE)
	if (typeof toBaseDef !== 'function') return ''

	let innerDef = ''
	if (zodType === 'ZodEnum') innerDef = Object.keys(fieldMeta.schema!).map((key) => JSON.stringify(key)).join(', ')
	if (zodType === 'ZodArray' && !(fieldMeta.schema as any)?.name) innerDef = `z${getBaseDef((fieldMeta.schema as any)!.zodType)?.(fieldMeta?.schema as any$Ignore)}`
	if (zodType === 'ZodArray' && (fieldMeta.schema as any)?.name) innerDef = (fieldMeta.schema as any)!.name
	if (zodType === 'ZodObject' && (fieldMeta.schema as any)?.name) innerDef = (fieldMeta.schema as any)!.name
	if (zodType === 'ZodObject' && !(fieldMeta.schema as any)?.name) innerDef = `...`
	if (zodType === 'ZodTuple') innerDef = (fieldMeta.schema as Meta$Tuple[])!.map((entry) => `z${getBaseDef(entry.zodType)?.(entry)}`).join(', ')
	if (zodType === 'ZodUnion') innerDef = (fieldMeta.schema as Meta$Union[])!.map((entry) => `z${getBaseDef(entry.zodType)?.(entry)}`).join(', ')
	if (zodType === 'ZodLiteral') innerDef = JSON.stringify(fieldMeta.literalValue)
	if (zodType === 'ZodRecord' && (fieldMeta.schema as any)?.name) innerDef = `z.string(), ${(fieldMeta.schema as any)!.name}`
	if (zodType === 'ZodRecord' && !(fieldMeta.schema as any)?.name) innerDef = `z.string(), z${getBaseDef((fieldMeta.schema as any)!.zodType)?.(fieldMeta.schema as any$Ignore)}`
	let baseDefV4 = toBaseDef(fieldMeta, innerDef)

	const tab = `    `
	const tabs = tab.repeat(2)

	let optionality = ``
	if (fieldMeta.isOptional) optionality = `${tabs}.optional()`
	if (fieldMeta.isNullable) optionality = `${tabs}.nullable()`
	if (fieldMeta.isNullable && fieldMeta.isOptional) optionality = `${tabs}.nullish()`
	if (fieldMeta.defaultValue) optionality = `${tabs}.default(${JSON.stringify(fieldMeta.defaultValue)})`

	const fieldEntry = [
		`${tab}${fieldKey}: z`,
		`${tabs}${baseDefV4}`,
		fieldMeta.isIndex && `${tabs}.index()`,
		fieldMeta.isUnique && `${tabs}.unique()`,
		fieldMeta.isSparse && `${tabs}.sparse()`,
		fieldMeta.isInt && `${tabs}.int()`,
		fieldMeta.isEmail && `${tabs}.email()`,
		fieldMeta.isURL && `${tabs}.url()`,
		fieldMeta.isUUID && `${tabs}.uuid()`,
		fieldMeta.isBase64 && `${tabs}.base64()`,
		fieldMeta.isDate && `${tabs}.date()`,
		fieldMeta.isDatetime && `${tabs}.datetime()`,
		fieldMeta.isTime && `${tabs}.time()`,
		fieldMeta.isIP && `${tabs}.ip()`,
		fieldMeta.minLength && `${tabs}.min(${fieldMeta.minLength})`,
		fieldMeta.maxLength && `${tabs}.max(${fieldMeta.maxLength})`,
		fieldMeta.exactLength && `${tabs}.length(${fieldMeta.exactLength})`,
		fieldMeta.minValue && `${tabs}.min(${fieldMeta.minValue})`,
		fieldMeta.maxValue && `${tabs}.max(${fieldMeta.maxValue})`,
		optionality,
		fieldMeta.exampleValue && `${tabs}.example(${JSON.stringify(fieldMeta.exampleValue)})`,
		fieldMeta.description && `${tabs}.describe(${JSON.stringify(fieldMeta.description)})`,
		fieldMeta.isSensitive && `${tabs}.sensitive() // = stripped in API responses, serverside only`,
	].filter(Boolean).join('\n')

	return `${fieldEntry},`
}

/* --- renderSchemaToZodDefV4() ---------------------------------------------------------------- */

export const renderSchemaToZodDefV4 = (schemaMeta: Meta$Schema, flavor: 'ZOD' | 'FPD' = 'ZOD') => {

	if (!schemaMeta.schema || typeof schemaMeta.schema !== 'object') {
		console.log(`Schema '${schemaMeta.name}' has no fields defined:`, schemaMeta)
		return ''
	}

	const fieldDefs = Object.entries(schemaMeta.schema!).map(([fieldKey, fieldMeta]) => {
		return renderFieldMetaToZodDefV4(fieldKey, fieldMeta)
	})

	return [
		flavor === 'FPD' && `const ${schemaMeta.name} = schema('${schemaMeta.name}', {`,
		flavor === 'ZOD' && `const ${schemaMeta.name} = z.object({`,
		    ...fieldDefs,
		`})`,
	].filter(Boolean).join('\n')
}

/* --- Re-exports ------------------------------------------------------------------------------ */

export { z } from 'zod/v4'
