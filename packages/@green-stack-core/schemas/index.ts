import { z, ZodObject, ZodType } from 'zod'
import type { ComponentProps, JSX, JSXElementConstructor } from 'react'

/* --- Constants ------------------------------------------------------------------------------- */

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

export const ZOD_TO_DEF = {
    // - Primitives -
    ZodString: (fieldMeta: Metadata) => `.string()`,
    ZodNumber: (fieldMeta: Metadata) => `.number()`,
    ZodBoolean: (fieldMeta: Metadata) => `.boolean()`,
    ZodDate: (fieldMeta: Metadata) => `.date()`,
    // - Advanced & Objectlikes -
    ZodEnum: (fieldMeta: Metadata, innerDef = '...') => `.enum([${innerDef}])`,
    ZodArray: (fieldMeta: Metadata, innerDef = '...') => `.array(${innerDef})`,
    ZodObject: (fieldMeta: Metadata, innerDef = '...') => `.object({\n${innerDef}\n})`,
    // - Mostly Supported, Experimental -
    ZodNull: (fieldMeta: Metadata) => `.null()`,
    ZodUndefined: (fieldMeta: Metadata) => `.undefined()`,
    ZodTuple: (fieldMeta: Metadata, innerDef = '..., ...') => `.tuple([${innerDef}])`,
    ZodUnion: (fieldMeta: Metadata, innerDef = '..., ...') => `.union([${innerDef}])`,
    ZodLiteral: (fieldMeta: Metadata, innerDef = '...') => `.literal(${innerDef})`,
    ZodNativeEnum: (fieldMeta: Metadata, innerDef = '...') => `.nativeEnum(${innerDef})`,
    // - Might Work, Not Advised -
    ZodAny: (fieldMeta: Metadata) => `.any()`,
    ZodRecord: (fieldMeta: Metadata, innerDef = '...') => `.record(${innerDef})`,
    ZodUnknown: (fieldMeta: Metadata) => `.unknown()`,
    ZodBigInt: (fieldMeta: Metadata) => `.bigint()`,
    ZodSymbol: (fieldMeta: Metadata) => `.symbol()`,
    ZodIntersection: (fieldMeta: Metadata, innerDef = '...') => `.intersection(${innerDef})`,
    ZodDiscriminatedUnion: (fieldMeta: Metadata, innerDef = '...') => `.discriminatedUnion(${innerDef})`,
    ZodMap: (fieldMeta: Metadata, innerDef = '...') => `.map(${innerDef})`,
    ZodSet: (fieldMeta: Metadata, innerDef = '...') => `.set(${innerDef})`,
    // - Unsupported, Avoid in Schemas -
    ZodVoid: (fieldMeta: Metadata) => `.void()`,
    ZodFunction: (fieldMeta: Metadata) => `.function()`,
    ZodPromise: (fieldMeta: Metadata) => `.promise()`,
    ZodLazy: (fieldMeta: Metadata, innerDef = '...') => `.lazy(() => ${innerDef})`,
    ZodEffects: (fieldMeta: Metadata, innerDef = '...') => `.effects(() => ${innerDef})`,
} as const

/* --- Types ----------------------------------------------------------------------------------- */

export type ZOD_TYPE = keyof typeof ZOD_TO_BASE
export type BASE_TYPE = typeof ZOD_TO_BASE[ZOD_TYPE]
export type SCHEMA_TYPE = (ZOD_TYPE | BASE_TYPE) & {}

export type Metadata<S = Record<string, any$Unknown> | any$Unknown[]> = {
    zodType: ZOD_TYPE,
    baseType: BASE_TYPE,
    name?: string,
    isOptional?: boolean,
    isNullable?: boolean,
    defaultValue?: any$Unknown,
    exampleValue?: any$Unknown,
    description?: string,
    minLength?: number,
    maxLength?: number,
    exactLength?: number,
    minValue?: number,
    maxValue?: number,
    isInt?: boolean,
    isBase64?: boolean,
    isEmail?: boolean,
    isURL?: boolean,
    isUUID?: boolean,
    isDate?: boolean,
    isDatetime?: boolean,
    isTime?: boolean,
    isIP?: boolean,
    literalValue?: any$Unknown,
    literalType?: 'string' | 'boolean' | 'number',
    literalBase?: BASE_TYPE,
    schema?: S,
    // The actual Zod objects, only included with .introspect(true)
    zodStruct?: z.ZodType & { _def: z.ZodTypeDef & { typeName: ZOD_TYPE } }, // wrapped, outermost
    innerStruct?: z.ZodType & { _def: z.ZodTypeDef & { typeName: ZOD_TYPE } }, // unwrapped
    // Mark as serverside only, strippable in API responses
    isSensitive?: boolean,
    // Compatibility with other systems like databases & drivers
    isID?: boolean,
    isIndex?: boolean,
    isUnique?: boolean,
    isSparse?: boolean,
}

export type Meta$Schema = Metadata<Record<string, Metadata>>
export type Meta$Tuple = Metadata<Metadata[]>
export type Meta$Union = Metadata<Metadata[]>
export type Meta$Intersection = Metadata<{ left: Metadata, right: Metadata }>

type StackedMeta = Metadata & {
    innerStruct?: z.ZodType & { _def: z.ZodTypeDef & { typeName: ZOD_TYPE } },
    zodStruct?: z.ZodType & { _def: z.ZodTypeDef & { typeName: ZOD_TYPE } },
}

export type ZodSchema<S extends z.ZodRawShape = z.ZodRawShape> = z.ZodObject<S>
    | z.ZodNullable<z.ZodObject<S>>
    | z.ZodOptional<z.ZodObject<S>>
    | z.ZodDefault<z.ZodObject<S>>
    | z.ZodNullable<z.ZodOptional<z.ZodObject<S>>>
    | z.ZodNullable<z.ZodDefault<z.ZodObject<S>>>
    | z.ZodOptional<z.ZodNullable<z.ZodObject<S>>>
    | z.ZodOptional<z.ZodDefault<z.ZodObject<S>>>
    | z.ZodDefault<z.ZodNullable<z.ZodObject<S>>>
    | z.ZodDefault<z.ZodOptional<z.ZodObject<S>>>

export type ApplyDefaultsOptions = {
    logErrors?: boolean,
    stripUnknown?: boolean,
    stripSensitive?: boolean,
    applyExamples?: boolean,
}

export type PropsOf<
    C extends keyof JSX.IntrinsicElements | JSXElementConstructor<any$Unknown>,
    Z extends z.ZodObject<z.ZodRawShape>,
> = ComponentProps<C> & z.input<Z>

export type DocumentationProps<
    T extends Record<string, any$Unknown> = Record<string, any$Unknown>,
> = {
    componentName: string,
    propSchema: z.ZodObject<z.ZodRawShape>,
    propMeta: Record<string, Meta$Schema>,
    previewProps: Record<string, any$Unknown>,
    valueProp?: keyof T | HintedKeys,
    onChangeProp?: keyof T | HintedKeys,
    exampleProps?: Partial<T>,
    previewState?: {
        didMount?: boolean,
        didApplyParams?: boolean,
        didRegister?: boolean,
    }
}

/* --- Zod extensions -------------------------------------------------------------------------- */

declare module 'zod' {
    interface ZodType {
        metadata(): Record<string, any>,
        addMeta(meta: Record<string, any>): this
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
        Input = z.objectInputType<T, Catchall, UnknownKeys>
    > {
        nameSchema(name: string): this

        extendSchema<S extends z.ZodRawShape>(name: string, shape: S): ZodObject<T & S, UnknownKeys, Catchall>
        
        pickSchema<Mask extends z.util.Exactly<{ [k in keyof T]?: true; }, Mask>>(
            schemaName: string,
            mask: Mask
        ): z.ZodObject<Pick<T, Extract<keyof T, keyof Mask>>, UnknownKeys, Catchall>

        omitSchema<Mask extends z.util.Exactly<{ [k in keyof T]?: true; }, Mask>>(
            schemaName: string,
            mask: Mask
        ): z.ZodObject<Omit<T, keyof Mask>, UnknownKeys, Catchall>

        applyDefaults<
            D extends Partial<Input> & Record<string, any$Unknown>
        >(
            data: D,
            options?: ApplyDefaultsOptions
        ): D & Output

        documentationProps<
            P extends Input = Input,
            N extends string = string,
        >(
            componentName: N,
            config?: Partial<DocumentationProps<Partial<P>>>
        ): {
            componentName: N,
            propSchema: ZodObject<T, UnknownKeys, Catchall>,
            propMeta: Record<string, Meta$Schema>,
            previewProps: Partial<Input>,
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

// -i- Apply extensions if not added yet

if (!ZodType.prototype.metadata) {

    ZodType.prototype.metadata = function () {
        return this._def.metadata || {}
    }

    ZodType.prototype.addMeta = function (meta: Record<string, any>) {
        const This = (this as any).constructor
        return new This({
            ...this._def,
            metadata: { ...this._def.metadata, ...meta }
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

    ZodType.prototype.example = function (exampleValue) {
        return this.addMeta({ exampleValue })
    }
    ZodType.prototype.eg = ZodType.prototype.example
    ZodType.prototype.ex = ZodType.prototype.example

    const getStackedMeta = <Z extends z.ZodTypeAny>(
        zodStruct: Z,
        stackedMeta = [] as StackedMeta[],
        includeZodStruct = false
    ): StackedMeta[] => {
        // Start with actual metadata
        const meta = { ...zodStruct.metadata() }
        // Include the type in the stack, we'll remove it again later
        meta.zodStruct = zodStruct
        const zodType = zodStruct._def.typeName
        // Check optionality
        if (zodType === 'ZodOptional') meta.isOptional = true
        if (zodType === 'ZodDefault') meta.isOptional = true
        if (zodType === 'ZodNullable') meta.isNullable = true
        // Figure out the default & example values if there are any
        if (zodStruct._def.defaultValue) meta.defaultValue = zodStruct._def.defaultValue()
        if (meta.defaultValue instanceof Set) meta.defaultValue = Array.from(meta.defaultValue)
        if (meta.exampleValue instanceof Set) meta.exampleValue = Array.from(meta.exampleValue)
        if (meta.defaultValue instanceof Map) meta.defaultValue = Object.fromEntries(meta.defaultValue)
        if (meta.exampleValue instanceof Map) meta.exampleValue = Object.fromEntries(meta.exampleValue)
        // Add the description if there is one
        if (zodStruct._def.description) meta.description = zodStruct._def.description
        // Add array metadata if present
        if (zodStruct._def.minLength) meta.minLength = zodStruct._def.minLength.value
        if (zodStruct._def.maxLength) meta.maxLength = zodStruct._def.maxLength.value
        if (zodStruct._def.exactLength) meta.exactLength = zodStruct._def.exactLength.value
        // Add string metadata if present
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
        // Add number metadata if present
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
            meta.schema = _zodUnion.options.reduce((acc: any, option: any) => {
                return { ...acc, types: [...acc.types, option.introspect?.(includeZodStruct)] }
            }, { discriminator: _zodUnion._def.discriminator, types: [] })
        }
        // Arrays
        if (zodType === 'ZodArray') {
            const _zodArray = zodStruct as unknown as z.ZodArray<any>
            meta.schema = _zodArray._def.type.introspect?.(includeZodStruct)
        }
        // Schemas & Objects
        if (zodType === 'ZodObject') {
            const _zodObject = zodStruct as unknown as z.ZodObject<any>
            meta.schema = Object.entries(_zodObject.shape).reduce((acc, [key, fieldType]) => {
                // @ts-ignore
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
        // Functions
        if (zodType === 'ZodFunction') {
            const _zodFunction = zodStruct as unknown as z.ZodFunction<any, any>
            meta.schema = {
                input: _zodFunction._def.args.introspect?.(includeZodStruct),
                output: _zodFunction._def.returns.introspect?.(includeZodStruct),
            }
        }
        // Promises
        if (zodType === 'ZodPromise') {
            const _zodPromise = zodStruct as unknown as z.ZodPromise<any>
            meta.schema = _zodPromise._def.type.introspect?.(includeZodStruct)
        }
        // Include innerStruct?
        const isInnerMostStruct = !zodStruct._def.innerType
        if (isInnerMostStruct && includeZodStruct) meta.innerStruct = zodStruct
        // Add the metadata for the current type
        const currentMetaStack = [...stackedMeta, meta as Metadata]
        // If we've reached the innermost type, end recursion, return all metadata
        if (isInnerMostStruct) return currentMetaStack
        // If there's another inner layer, unwrap it, add to the stack
        return getStackedMeta(zodStruct._def.innerType, currentMetaStack, includeZodStruct)
    }

    ZodType.prototype.introspect = function (includeZodStruct = false) {
        // Figure out nested metadata
        const stackedMeta = getStackedMeta(this, [], includeZodStruct)
        const reversedMeta = [...stackedMeta].reverse()
        const [innermostMeta] = reversedMeta
        const zodType = innermostMeta.zodStruct!._def.typeName as unknown as ZOD_TYPE
        const baseType = ZOD_TO_BASE[zodType as ZOD_TYPE]
        // Flatten stacked metadata in reverse order
        const flatMeta = reversedMeta.reduce((acc, { zodStruct, ...meta }) => ({
            ...acc,
            ...meta,
            ...(includeZodStruct ? { zodStruct } : {})
        }), {})
        const meta = { ...flatMeta, zodType, baseType }
        // @ts-ignore
        if (meta.literalBase) meta.baseType = meta.literalBase
        // Return all introspected metadata
        return meta
    }

    ZodObject.prototype.nameSchema = function (name: string) {
        return this.addMeta({ name })
    }

    ZodObject.prototype.extendSchema = function (name: string, shape) {
        return this.extend(shape).nameSchema(name)
    }

    ZodObject.prototype.pickSchema = function (schemaName, picks) {
        return this.pick(picks).nameSchema(schemaName)
    }

    ZodObject.prototype.omitSchema = function (schemaName, picks) {
        return this.omit(picks).nameSchema(schemaName)
    }

    ZodObject.prototype.applyDefaults = function <
        D extends Partial<(typeof thisSchema)['_input']> & Record<string, any$Unknown>
    >(
        data: D,
        options: ApplyDefaultsOptions = {},
    ) {
        const {
            logErrors = false,
            stripUnknown = false,
            stripSensitive = false,
            applyExamples = false,
        } = options
        const thisSchema = this.extend({})
        const result = thisSchema.safeParse(data)
        const introSpectionResult = thisSchema.introspect(stripSensitive)
        const defaultValues = Object.keys(introSpectionResult.schema!).reduce((acc, key) => {
            const fieldMeta = introSpectionResult.schema![key] as Metadata
            const defaultValue = applyExamples ? fieldMeta.exampleValue : fieldMeta.defaultValue
            const hasDefault = defaultValue !== undefined
            return hasDefault ? { ...acc, [key]: defaultValue } : acc
        }, {})
        // Include default values from introspection
        const values = {
            ...defaultValues,
            ...data,
            ...(!applyExamples ? result.data : {}),
        } as (typeof thisSchema)['_type']
        // Apply options to nested schemas?
        if (stripSensitive || stripUnknown) {
            // Also strip unknown or sensitive keys within nested schemas
            Object.keys(introSpectionResult.schema!).forEach(key => {
                const fieldMeta = introSpectionResult.schema![key] as Metadata // @ts-ignore
                const isObject = fieldMeta.zodType == 'ZodObject'
                // Skip if empty or not a nested schema
                if (!data[key] || !isObject) return
                const innerMeta = fieldMeta.zodStruct?.introspect?.(true)
                if (!innerMeta) return // @ts-ignore
                const InnerSchema = innerMeta?.innerStruct // @ts-ignore
                if (!InnerSchema?.applyDefaults) return
                // Apply options recursively
                const oldData = { ...values[key] } // @ts-ignore
                const newData = InnerSchema.applyDefaults(oldData, options)
                values[key] = newData
            })
        }
        // Remove sensitive keys?
        if (stripSensitive) {
            Object.keys(introSpectionResult.schema!).forEach(key => {
                const fieldMeta = introSpectionResult.schema![key] as Metadata
                if (fieldMeta.isSensitive) delete values[key]
            })
        }
        // Log errors if requested
        if (!result.success && logErrors) console.warn(JSON.stringify(result.error, null, 2))
        // Strip unknown keys if requested
        if (stripUnknown) {
            const validKeys = Object.keys(thisSchema.shape)
            const validData = Object.fromEntries(Object.entries(values).filter(([key]) => validKeys.includes(key)))
            return { ...validData } as D & (typeof thisSchema)['_type']
        }
        // @ts-ignore
        return values as D & (typeof thisSchema)['_type']
    }

    ZodObject.prototype.documentationProps = function (
        componentName,
        config = {},
    ) {
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

    // Create the enum from the keys only
    const zEnum = z.enum(Object.keys(obj) as [K, ...K[]])

    // Assign the entries to the enum so it can still be used as such
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
    
    // Find related base definition builder
    const getBaseDef = (key: ZOD_TYPE) => ZOD_TO_DEF[key as keyof typeof ZOD_TO_DEF]
    const toBaseDef = getBaseDef(zodType as ZOD_TYPE)
    if (typeof toBaseDef !== 'function') return ''

    // Determine the inner definition if required
    let innerDef = ''
    if (zodType === 'ZodEnum') innerDef = Object.keys(fieldMeta.schema!).map((key) => JSON.stringify(key)).join(', ') // @ts-ignore
    if (zodType === 'ZodArray' && !fieldMeta.schema?.name) innerDef = `z${getBaseDef(fieldMeta.schema!.zodType)?.(fieldMeta.schema)}` // @ts-ignore
    if (zodType === 'ZodArray' && fieldMeta.schema?.name) innerDef = fieldMeta.schema!.name // @ts-ignore
    if (zodType === 'ZodObject' && fieldMeta.schema?.name) innerDef = fieldMeta.schema!.name // @ts-ignore
    if (zodType === 'ZodObject' && !fieldMeta.schema?.name) innerDef = `...` // TODO: Fix this?
    if (zodType === 'ZodTuple') innerDef = fieldMeta.schema!.map((entry: Meta$Tuple) => `z${getBaseDef(entry.zodType)?.(entry)}`).join(', ')
    if (zodType === 'ZodUnion') innerDef = fieldMeta.schema!.map((entry: Meta$Union) => `z${getBaseDef(entry.zodType)?.(entry)}`).join(', ')
    if (zodType === 'ZodLiteral') innerDef = JSON.stringify(fieldMeta.literalValue) // @ts-ignore
    if (zodType === 'ZodRecord' && fieldMeta.schema?.name) innerDef = `z.string(), ${fieldMeta.schema!.name}` // @ts-ignore
    if (zodType === 'ZodRecord' && !fieldMeta.schema?.name) innerDef = `z.string(), z${getBaseDef(fieldMeta.schema!.zodType)?.(fieldMeta.schema!)}` // @ts-ignore

    // Build the base definition for unproblematic types
    let baseDefV3 = toBaseDef(fieldMeta, innerDef)

    // Constants
    const tab = `    `
    const tabs = tab.repeat(2)

    // Figure out whether to use optionality / which one
    let optionality = ``
    if (fieldMeta.isOptional) optionality = `${tabs}.optional()`
    if (fieldMeta.isNullable) optionality = `${tabs}.nullable()`
    if (fieldMeta.isNullable && fieldMeta.isOptional) optionality = `${tabs}.nullish()`
    if (fieldMeta.defaultValue) optionality = `${tabs}.default(${JSON.stringify(fieldMeta.defaultValue)})`

    // Rebuild the Zod definition for this field
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

    // Return the field entry
    return `${fieldEntry},`
}

/** --- renderSchemaToZodDefV3() --------------------------------------------------------------- */
/** -i- Renders schema Metadata to Zod V3 flavoured schema definition (as a string) */
export const renderSchemaToZodDefV3 = (schemaMeta: Meta$Schema, flavor: 'ZOD' | 'FPD' = 'ZOD') => {
    
    // Check if schema metadata is empty / incompatible
    if (!schemaMeta.schema || typeof schemaMeta.schema !== 'object') {
        console.log(`Schema '${schemaMeta.name}' has no fields defined:`, schemaMeta)
        return ''
    }
    
    // Build list of fieldDefinitions
    const fieldDefs = Object.entries(schemaMeta.schema!).map(([fieldKey, fieldMeta]) => {
        return renderFieldMetaToZodDefV3(fieldKey, fieldMeta)
    })

    // Rebuild the Zod definition for this field
    return [
        flavor === 'FPD' && `const ${schemaMeta.name} = schema('${schemaMeta.name}', {`,
        flavor === 'ZOD' && `const ${schemaMeta.name} = z.object({`,
            ...fieldDefs,
        `})`,
    ].filter(Boolean).join('\n')
}

/* --- Reexports ------------------------------------------------------------------------------- */

export { z } from 'zod'
