// -i- Zod V3 module extension.
// -i- Import only from zod/v3. Re-exports compat + v3-specific extensions.

import { z, ZodObject, ZodType } from 'zod/v3'
import type { ApplyDefaultsOptions, Metadata, Meta$Schema, Meta$Tuple, Meta$Union, StackedMeta, ZOD_TYPE } from './schemas.compat'
import { ZOD_TO_BASE } from './schemas.compat'

/* --- Re-exports ------------------------------------------------------------------------------ */

export * from './schemas.compat'

/* --- ZOD_TO_DEF (v3-specific code-gen) ------------------------------------------------------- */

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

/* --- ZodSchema (v3-specific) ------------------------------------------------------------------ */

export type ZodSchema<S extends z.ZodRawShape = z.ZodRawShape> =
	| z.ZodObject<S>
	| z.ZodNullable<z.ZodObject<S>>
	| z.ZodOptional<z.ZodObject<S>>
	| z.ZodDefault<z.ZodObject<S>>
	| z.ZodNullable<z.ZodOptional<z.ZodObject<S>>>
	| z.ZodNullable<z.ZodDefault<z.ZodObject<S>>>
	| z.ZodOptional<z.ZodNullable<z.ZodObject<S>>>
	| z.ZodOptional<z.ZodDefault<z.ZodObject<S>>>
	| z.ZodDefault<z.ZodNullable<z.ZodObject<S>>>
	| z.ZodDefault<z.ZodOptional<z.ZodObject<S>>>

/* --- Module augmentation (zod/v3) ------------------------------------------------------------ */

declare module 'zod/v3' {

	interface ZodType {
		metadata(): Record<string, any$Unknown>
		addMeta(meta: Record<string, any$Unknown>): this
		sensitive(): this
		index(): this
		unique(): this
		sparse(): this
		example<T extends this['_type']>(exampleValue: T): this
		eg<T extends this['_type']>(exampleValue: T): this
		ex<T extends this['_type']>(exampleValue: T): this
		introspect(includeZodStruct?: boolean): Meta$Schema & Record<string, any>
	}

	interface ZodObject<
		T extends z.ZodRawShape,
		UnknownKeys extends z.UnknownKeysParam = z.UnknownKeysParam,
		Catchall extends z.ZodTypeAny = z.ZodTypeAny,
		Output = z.objectOutputType<T, Catchall, UnknownKeys>,
		Input = z.objectInputType<T, Catchall, UnknownKeys>,
	> {

        name?: string

        // -- New methods --

		nameSchema(name: string): this

		extendSchema<S extends z.ZodRawShape>(name: string, shape: S): ZodObject<T & S, UnknownKeys, Catchall>

		pickSchema<Mask extends z.util.Exactly<{ [k in keyof T]?: true }, Mask>>(
			schemaName: string,
			mask: Mask
		): z.ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall>

		omitSchema<Mask extends z.util.Exactly<{ [k in keyof T]?: true }, Mask>>(
			schemaName: string,
			mask: Mask
		): z.ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall>

		applyDefaults<D extends Partial<Input> & Record<string, any$Unknown>>(
			data: D,
			options?: ApplyDefaultsOptions
		): D & Output

		documentationProps<Props extends Input = Input, Name extends string = string>(
			componentName: Name,
			config?: Partial<{ componentName: string; propSchema: any; propMeta: any; previewProps: any; exampleProps?: Partial<Props> }>
		): {
            componentName: Name;
            propSchema: ZodObject<T, UnknownKeys, Catchall>;
            propMeta: Record<string, Meta$Schema>;
            previewProps: Partial<Input>
        }

        // -- Deprecations --

		/** @deprecated Use `.extendSchema('NewName', { ...shape })` instead */
        extend<S extends z.ZodRawShape>(shape: S): ZodObject<T & S, UnknownKeys, Catchall>

        /** @deprecated Use `.pickSchema('NewName', { ...mask })` instead */
        pick<Mask extends z.util.Exactly<{ [k in keyof T]?: true; }, Mask>>(
            mask: Mask
        ): z.ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall>

        /** @deprecated Use `.omitSchema('NewName', { ...mask })` instead */
        omit<Mask extends z.util.Exactly<{ [k in keyof T]?: true; }, Mask>>(
            mask: Mask
        ): z.ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall>
	}
}

const getStackedMetaV3 = <Z extends z.ZodTypeAny>(
    zodStruct: Z,
    stackedMeta = [] as StackedMeta[],
    includeZodStruct = false
): StackedMeta[] => {

    // Start with actual metadata
    const meta = { ...zodStruct.metadata() }

    // Include the zod schema struct in the stack, we'll remove it again later
    meta.zodStruct = zodStruct
    const zodType = zodStruct._def.typeName

    // Unwrap optional, nullable & default
    if (zodType === 'ZodOptional') meta.isOptional = true
    if (zodType === 'ZodDefault') meta.isOptional = true
    if (zodType === 'ZodNullable') meta.isNullable = true

    // Figure out the default & example values?
    if (zodStruct._def.defaultValue) meta.defaultValue = zodStruct._def.defaultValue()
    if (meta.defaultValue instanceof Set) meta.defaultValue = Array.from(meta.defaultValue)
    if (meta.exampleValue instanceof Set) meta.exampleValue = Array.from(meta.exampleValue)
    if (meta.defaultValue instanceof Map) meta.defaultValue = Object.fromEntries(meta.defaultValue)
    if (meta.exampleValue instanceof Map) meta.exampleValue = Object.fromEntries(meta.exampleValue)

    // Add the description?
    if (zodStruct._def.description) meta.description = zodStruct._def.description

    // Add array specific metadata?
    if (zodStruct._def.minLength) meta.minLength = zodStruct._def.minLength.value
    if (zodStruct._def.maxLength) meta.maxLength = zodStruct._def.maxLength.value
    if (zodStruct._def.exactLength) meta.exactLength = zodStruct._def.exactLength.value

    // Add string specific metadata?
    const stringType = zodStruct as unknown as z.ZodString
    if (stringType.minLength) meta.minLength = stringType.minLength
    if (stringType.maxLength) meta.maxLength = stringType.maxLength
    if (stringType.isBase64) meta.isBase64 = true
    if (stringType.isEmail) meta.isEmail = true
    if (stringType.isURL) meta.isURL = true
    if (stringType.isUUID) meta.isUUID = true
    if (stringType.isDate) meta.isDate = true
    if (stringType.isDatetime) meta.isDatetime = true
    if (stringType.isTime) meta.isTime = true
    if (stringType.isIP) meta.isIP = true
    if (meta.isUUID) meta.isID = true

    // Add number specific metadata?
    const numberType = zodStruct as unknown as z.ZodNumber
    if (numberType.minValue) meta.minValue = numberType.minValue
    if (numberType.maxValue) meta.maxValue = numberType.maxValue
    if (numberType.isInt) meta.isInt = numberType.isInt
    // Literals
    if (zodType === 'ZodLiteral') {
        const _zodLiteral = zodStruct as unknown as z.ZodLiteral<any>
        meta.literalValue = _zodLiteral.value
        meta.literalType = typeof meta.literalValue
        if (typeof meta.literalValue === 'string') meta.baseType = 'String'
        if (typeof meta.literalValue === 'number') meta.baseType = 'Number'
        if (typeof meta.literalValue === 'boolean') meta.baseType = 'Boolean'
        meta.literalBase = meta.baseType
    }
    // Enums
    if (zodType === 'ZodEnum') {
        const _inputOptions = zodStruct as unknown as z.ZodEnum<any>
        meta.schema = _inputOptions.options?.reduce((acc: Record<string, unknown>, value: any) => {
            return { ...acc, [value]: value }
        }, {})
    }
    // Tuples
    if (zodType === 'ZodTuple') {
        const _zodTuple = zodStruct as unknown as z.ZodTuple<any>
        meta.schema = _zodTuple.items.map((item: any) => item.introspect?.(includeZodStruct)).filter(Boolean)
    }
    // Unions
    if (zodType === 'ZodUnion') {
        const _zodUnion = zodStruct as unknown as z.ZodUnion<any>
        meta.schema = _zodUnion.options.map((option: any) => option.introspect?.(includeZodStruct)).filter(Boolean)
    }
    // Intersections
    if (zodType === 'ZodIntersection') {
        const _zodIntersection = zodStruct as unknown as z.ZodIntersection<any, any>
        meta.schema = {
            left: _zodIntersection._def.left.introspect?.(includeZodStruct),
            right: _zodIntersection._def.right.introspect?.(includeZodStruct),
        }
    }
    // Discriminated Unions
    if (zodType === 'ZodDiscriminatedUnion') {
        const _zodUnion = zodStruct as unknown as z.ZodDiscriminatedUnion<any, any>
        meta.schema = _zodUnion.options.reduce(
            (acc: any, option: any) => {
                return { ...acc, types: [...acc.types, option.introspect?.(includeZodStruct)] }
            },
            { discriminator: _zodUnion._def.discriminator, types: [] }
        )
    }
    // Arrays
    if (zodType === 'ZodArray') {
        const _zodArray = zodStruct as unknown as z.ZodArray<any>
        meta.schema = _zodArray._def.type.introspect?.(includeZodStruct)
    }
    // Objects + Schemas
    if (zodType === 'ZodObject') {
        const _zodObject = zodStruct as unknown as z.ZodObject<any>
        meta.schema = Object.entries(_zodObject.shape).reduce((acc: any, [key, fieldType]: [string, any]) => {
            return { ...acc, [key]: fieldType.introspect?.(includeZodStruct) }
        }, {})
    }
    // Records
    if (zodType === 'ZodRecord') {
        const _zodRecord = zodStruct as unknown as z.ZodRecord<any>
        meta.schema = _zodRecord._def.valueType.introspect?.(includeZodStruct)
    }
    // Sets
    if (zodType === 'ZodSet') {
        const _zodSet = zodStruct as unknown as z.ZodSet<any>
        meta.schema = _zodSet._def.valueType.introspect?.(includeZodStruct)
    }
    // Maps
    if (zodType === 'ZodMap') {
        const _zodMap = zodStruct as unknown as z.ZodMap<any, any>
        meta.schema = {
            key: _zodMap._def.keyType.introspect?.(includeZodStruct),
            value: _zodMap._def.valueType.introspect?.(includeZodStruct),
        }
    }
    // Functions (changed in v4: https://zod.dev/v4/changelog#zfunction)
    if (zodType === 'ZodFunction') {
        const _zodFunction = zodStruct as unknown as z.ZodFunction<any, any>
        meta.schema = {
            input: _zodFunction._def.args.introspect?.(includeZodStruct),
            output: _zodFunction._def.returns.introspect?.(includeZodStruct),
        }
    }
    // Promises (deprecated in v4: https://zod.dev/v4/changelog?id=zpromise-deprecated)
    if (zodType === 'ZodPromise') {
        const _zodPromise = zodStruct as unknown as z.ZodPromise<any>
        meta.schema = _zodPromise._def.type.introspect?.(includeZodStruct)
    }
    // Include the original Zod v3 schema struct?
    const isInnerMostStruct = !zodStruct._def.innerType
    if (isInnerMostStruct && includeZodStruct) meta.innerStruct = zodStruct
    // Add the metadata for the current introspection level to the stack
    const currentMetaStack = [...stackedMeta, meta as StackedMeta]
    // If we've reached the innermost type, end recursion, return all metadata
    if (isInnerMostStruct) return currentMetaStack
    // If there's another inner layer, unwrap it, add to the stack
    return getStackedMetaV3(zodStruct._def.innerType, currentMetaStack, includeZodStruct)
}

/* --- Prototype patches ----------------------------------------------------------------------- */
// -i- Registers module extensions for Zod v3 if not already applied

if (!ZodType.prototype.metadata) {

	ZodType.prototype.metadata = function () {
		return this._def.metadata || {}
	}

	ZodType.prototype.addMeta = function (meta: Record<string, any$Unknown>) {
		const This = (this as any).constructor
		return new This({
			...this._def,
			metadata: { ...this._def.metadata, ...meta },
		})
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
	ZodType.prototype.eg = (ZodType.prototype as any).example
	ZodType.prototype.ex = (ZodType.prototype as any).example

    ZodType.prototype.introspect = function (includeZodStruct = false) {
        // Figure out nested metadata
		const stackedMeta = getStackedMetaV3(this, [], includeZodStruct)
		const reversedMeta = [...stackedMeta].reverse()
		const [innermostMeta] = reversedMeta // @ts-ignore
		const zodType = innermostMeta.zodStruct!._def.typeName as unknown as ZOD_TYPE
		const baseType = ZOD_TO_BASE[zodType as keyof typeof ZOD_TO_BASE]
        // Flatten stacked metadata in reverse order
		const flatMeta = reversedMeta.reduce(
			(acc, { zodStruct, ...meta }) => ({
				...acc,
				...meta,
				...(includeZodStruct ? { zodStruct } : {}),
			}),
			{} as any
		)
		const meta = { ...flatMeta, zodType, baseType }
        // @ts-ignore
		if (meta.literalBase) meta.baseType = meta.literalBase
        // Return the flattened metadata
		return meta
	}

	ZodObject.prototype.nameSchema = function (name: string) {
		return this.addMeta({ name })
	}

	ZodObject.prototype.extendSchema = function (name: string, shape) {
		return this.extend(shape).nameSchema(name)
	}

	ZodObject.prototype.pickSchema = function (schemaName: string, picks) {
		return this.pick(picks).nameSchema(schemaName)
	}

	ZodObject.prototype.omitSchema = function (schemaName: string, picks) {
		return this.omit(picks).nameSchema(schemaName)
	}

	ZodObject.prototype.applyDefaults = function <
        D extends Partial<(typeof thisSchema)['_input']> & Record<string, any$Unknown>,
    >(
        data: D,
        options: ApplyDefaultsOptions = {}
    ) {

		const {
            logErrors = false,
            stripUnknown = false,
            stripSensitive = false,
            applyExamples = false
        } = options

        // Extends schema to enable parsing for the introspection result
		const thisSchema = this.extend({})
		const result = thisSchema.safeParse(data)
		const introSpectionResult = thisSchema.introspect(stripSensitive)
        // Figure out the default values
		const defaultValues = Object.keys(introSpectionResult.schema!).reduce((acc, key) => {
			const fieldMeta = introSpectionResult.schema![key] as Metadata
			const defaultValue = applyExamples ? fieldMeta.exampleValue : fieldMeta.defaultValue
			const hasDefault = defaultValue !== undefined
			return hasDefault ? { ...acc, [key]: defaultValue } : acc
		}, {} as Record<string, any>)
        // Include default values from introspection?
		const values = {
			...defaultValues,
			...data,
			...(!applyExamples ? result.data : {}),
		} as (typeof thisSchema)['_type']
        // Strip sensitive or unknown fields?
		if (stripSensitive || stripUnknown) {
			Object.keys(introSpectionResult.schema!).forEach((key) => {
				const fieldMeta = introSpectionResult.schema![key] as Metadata
				const isObject = (fieldMeta as any).zodType == 'ZodObject'
                // Skip if empty or not nested
				if (!data[key] || !isObject) return
				const innerMeta = (fieldMeta as any).zodStruct?.introspect?.(true)
				if (!innerMeta) return
				const InnerSchema = innerMeta?.innerStruct
				if (!InnerSchema?.applyDefaults) return
                // Apply all options recursively to nested schemas
				const oldData = { ...values[key] }
				const newData = InnerSchema.applyDefaults(oldData, options)
				values[key] = newData
			})
		}
        // Remove sensitive fields?
		if (stripSensitive) {
			Object.keys(introSpectionResult.schema!).forEach((key) => {
				const fieldMeta = introSpectionResult.schema![key] as Metadata
				if (fieldMeta.isSensitive) delete values[key]
			})
		}
        // Log errors?
		if (!result.success && logErrors) console.warn(JSON.stringify(result.error, null, 2))
        // Strip unknown fields?
		if (stripUnknown) {
			const validKeys = Object.keys(thisSchema.shape)
			const validData = Object.fromEntries(Object.entries(values).filter(([key]) => validKeys.includes(key)))
			return { ...validData } as D & (typeof thisSchema)['_type']
		}
        // Return the input with defaults applied
		return values as D & (typeof thisSchema)['_type']
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

/** --- schema() ------------------------------------------------------------------------------- */
/** -i- Similar to z.object(), but requires a name so it may serve as a single source of truth */
export const schema = <S extends z.ZodRawShape>(name: string, shape: S) => {
	return z.object(shape).nameSchema(name)
}

/** --- inputOptions() --------------------------------------------------------------------------- */
/** -i- Builds a zod enum from a read-only object keys, but ensures you can still use it as an actual enum
 * @example const MyEnum = inputOptions({ key1: 'Some label', key2: '...' })
 * 
 * // 💡 Use .entries to get the original object with keys + labels
 * MyEnum.entries // { key1: 'Some label', key2: '...' }
 * 
 * // 💡 Get auto-completion for the enum values / option keys
 * MyEnum.key1 // => 'key1'
 * MyEnum.enum.key1 // => 'key1' (alternatively)
 * 
 * // 💡 Retrieve list of options as a tuple with the .options property
 * MyEnum.options // => ['key1', 'key2'] */
export const inputOptions = <T extends Readonly<Record<string, string>>>(obj: T) => {

    // Extract the keys from the object
	type K = Exclude<keyof T, number | symbol>

    // Create a Zod enum from the object keys
	const zEnum = z.enum(Object.keys(obj) as [K, ...K[]])

    // Reassigne the object keys to the Zod enum so it can be used as an actual enum
	const reassigned = Object.keys(obj).reduce((acc, key) => {
		return Object.assign(acc, { [key]: obj[key] })
	}, zEnum)

    // Return the enum with the entries
	return Object.assign(reassigned, { entries: obj }) as typeof zEnum & { entries: T } & {
		[K in keyof T]: T[K]
	}
}

/** --- renderFieldMetaToZodDefV3() ------------------------------------------------------------ */
/** -i- Renders field Metadata to Zod V3 field definition (as a string) */
export const renderFieldMetaToZodDefV3 = (fieldKey: string, fieldMeta: Metadata) => {

    // Extract metadata
	const { zodType } = fieldMeta

    // Find the related base definition
	const getBaseDef = (key: ZOD_TYPE) => ZOD_TO_DEF[key as keyof typeof ZOD_TO_DEF]
	const toBaseDef = getBaseDef(zodType as ZOD_TYPE)
	if (typeof toBaseDef !== 'function') return ''

    // Determine the inner definition if required
	let innerDef = ''
    const fieldSchema = fieldMeta.schema as Meta$Schema
	if (zodType === 'ZodEnum') innerDef = Object.keys(fieldSchema!).map((key) => JSON.stringify(key)).join(', ')
	if (zodType === 'ZodArray' && !fieldSchema?.name) innerDef = `z${getBaseDef(fieldSchema!.zodType)?.(fieldSchema)}`
	if (zodType === 'ZodArray' && fieldSchema?.name) innerDef = fieldSchema!.name
	if (zodType === 'ZodObject' && fieldSchema?.name) innerDef = fieldSchema!.name
	if (zodType === 'ZodObject' && !fieldSchema?.name) innerDef = `...`
	if (zodType === 'ZodTuple') innerDef = (fieldMeta.schema as Meta$Tuple[])!.map((entry) => `z${getBaseDef(entry.zodType)?.(entry)}`).join(', ')
	if (zodType === 'ZodUnion') innerDef = (fieldMeta.schema as Meta$Union[])!.map((entry) => `z${getBaseDef(entry.zodType)?.(entry)}`).join(', ')
	if (zodType === 'ZodLiteral') innerDef = JSON.stringify(fieldMeta.literalValue)
	if (zodType === 'ZodRecord' && fieldSchema?.name) innerDef = `z.string(), ${fieldSchema!.name}`
	if (zodType === 'ZodRecord' && !fieldSchema?.name) innerDef = `z.string(), z${getBaseDef(fieldSchema!.zodType)?.(fieldSchema!)}`
	
    // Build the base definition
    let baseDefV3 = toBaseDef(fieldMeta, innerDef)

    // Constants
	const tab = `    `
	const tabs = tab.repeat(2)

    // Figure out whether we should make the field optional / nullable / nullish / defaulted
	let optionality = ``
	if (fieldMeta.isOptional) optionality = `${tabs}.optional()`
	if (fieldMeta.isNullable) optionality = `${tabs}.nullable()`
	if (fieldMeta.isNullable && fieldMeta.isOptional) optionality = `${tabs}.nullish()`
	if (fieldMeta.defaultValue) optionality = `${tabs}.default(${JSON.stringify(fieldMeta.defaultValue)})`

    // Rebuild the Zod definition string
	const fieldEntry = [

		`${tab}${fieldKey}: z`,
		`${tabs}${baseDefV3}`,
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

    // Return field definition string
	return `${fieldEntry},`
}

/** --- renderSchemaToZodDefV3() --------------------------------------------------------------- */
/** -i- Renders schema Metadata to Zod V3 flavoured schema definition (as a string) */
export const renderSchemaToZodDefV3 = (schemaMeta: Meta$Schema, flavor: 'ZOD' | 'FPD' = 'ZOD') => {

    // Check if the schema has fields defined
	if (!schemaMeta.schema || typeof schemaMeta.schema !== 'object') {
		console.log(`Schema '${schemaMeta.name}' has no fields defined:`, schemaMeta)
		return ''
	}

    // Build list of field definitions
	const fieldDefs = Object.entries(schemaMeta.schema!).map(([fieldKey, fieldMeta]) => {
		return renderFieldMetaToZodDefV3(fieldKey, fieldMeta)
	})

    // Rebuild the entire Zod v3 definition string
	return [
		flavor === 'FPD' && `const ${schemaMeta.name} = schema('${schemaMeta.name}', {`,
		flavor === 'ZOD' && `const ${schemaMeta.name} = z.object({`,
		    ...fieldDefs,
		`})`,
	].filter(Boolean).join('\n')
}

/* --- Re-exports ------------------------------------------------------------------------------- */

export { z } from 'zod/v3'
