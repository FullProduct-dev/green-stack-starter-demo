import type {
  NextApiRequest,
  NextApiResponse,
  GetServerSidePropsContext,
  GetStaticPathsContext,
  GetStaticPropsContext,
} from 'next'
import { getApiParams, getHeaderContext } from '../utils/apiUtils'
import { parseUrlParamsObject } from '../utils/objectUtils'
import { tryCatch } from '../utils/functionUtils'
import { z, ApplyDefaultsOptions } from './index'

/* --- Types ----------------------------------------------------------------------------------- */

export type ResolverConfigType = {
    logErrors?: boolean
    respondErrors?: boolean
    allowFail?: boolean
    onError?: (err: any) => unknown | void
    [key: string]: any
}
  
export type ResolverInputType<ArgsInput = any> = Partial<ArgsInput> & {
    req?: NextApiRequest | Request | GetServerSidePropsContext['req']
    res?: NextApiResponse | Response | GetServerSidePropsContext['res']
    nextSsrContext?: GetServerSidePropsContext
    nextStaticPathsContext?: GetStaticPathsContext
    nextStaticPropsContext?: GetStaticPropsContext
    parent?: any
    args?: ArgsInput
    params?: { [key: string]: ArgsInput[keyof ArgsInput] | unknown }
    paramKeys?: (keyof ArgsInput)[]
    context?: any
    info?: any
    cookies?: NextApiRequest['cookies']
    config?: ResolverConfigType,
}
  
export type ResolverExecutionParamsType<ArgsInput = any, ResOutput = any, ResInput = any> = {
    /** -i- Resolver arguments, sourced from either function or request search / query / body params */
    args: ArgsInput
    /** -i- Use to throw Errors at the start of business logic if input is invalid */
    parseArgs: (args: ArgsInput) => ArgsInput
    /** -i- Use to get output type hints / feedback, applies defaults and automatically strips sensitive and unknown fields before returning */
    withDefaults: (response: ResInput) => ResOutput
    /** -i- Use to get output type hints / feedback, formats output before returning, passing options to `OutputSchema.applyDefaults()` */
    formatOutput: (response: ResInput, formatOptions?: ApplyDefaultsOptions) => ResOutput
    /** -i- Attempt to execute a promise, wraps it with try / catch, but returns either the error or data if it fails */
    tryCatch: typeof tryCatch
    /** -i- The full resolver input & request context with all possible input info */
    context: Record<string, unknown> & {
        req: NextApiRequest | Request | GetServerSidePropsContext['req']
    },
    /** -i- Resolver config options to control whether you log errors, etc. @deprecated currently unused and just passed through to handle in resolver logic */
    config?: ResolverConfigType
    /** -i- Request object, only available during GraphQL or Route Handler mode, not stable during SSR */
    req?: NextApiRequest | Request | GetServerSidePropsContext['req']
    /** -i- Response object, only available during GraphQL or Route Handler mode, not stable during SSR */
    res?: NextApiResponse | Response | GetServerSidePropsContext['res']
    /** -i- Args type, `undefined` as value, use as `typeof Args` */
    Args: ArgsInput
    /** -i- Input type, `undefined` as value, use as `typeof Input` */
    Input: ArgsInput
    /** -i- Output type, `undefined` as value, use as `typeof Output` */
    Output: ResInput
    /** -i- Output type, `undefined` as value, use as `typeof Output` */
    Data: Partial<ResInput>
}

/** --- createResolver() ----------------------------------------------------------------------- */
/** -i- Wrap a server side resolver function for easy use in both graphQL & rest endpoints + provide error handling */
export const createResolver = <
    ArgsOverride = null, // Args type override
    ResOverride = null, // Response type override
    ArgsShape extends z.ZodRawShape = any,
    ResShape extends z.ZodRawShape = any,
    ArgsInput = ArgsOverride extends null ? z.ZodObject<ArgsShape>['_input'] : ArgsOverride,
    ResOutput = ResOverride extends null ? z.ZodObject<ResShape>['_output'] : ResOverride,
    ResInput = ResOverride extends null ? z.ZodObject<ResShape>['_input'] : ResOverride,
>(
    resolverFn: (ctx: ResolverExecutionParamsType<ArgsInput, ResOutput, ResInput>) => Promise<ResOutput | unknown>,
    options: {
        paramKeys?: string,
        inputSchema: z.ZodObject<ArgsShape>,
        outputSchema: z.ZodObject<ResShape>,
        isMutation?: boolean
    },
) => {
    // Extract options
    const { paramKeys, inputSchema, outputSchema, isMutation } = options
    // Build Resolver
    const resolverWrapper = (ctx?: ResolverInputType<ArgsInput>): Promise<ResOutput> => {
        
        const { 
            req, res, nextSsrContext, cookies: _,
            parent, args, context, info,
            config: resolverConfig,
            ...restParams
        } = ctx || {}
        const { logErrors, respondErrors, allowFail, onError } = resolverConfig || {}

        // -- Input & Args --
        
        // Collect params from all possible sources
        const { body, method } = (req as NextApiRequest) || {}
        const schemaParamKeys = Object.keys(inputSchema?.shape ?? {})
        const apiParamKeys = [ctx?.paramKeys, paramKeys || schemaParamKeys].flat().filter(Boolean).join(' ') // prettier-ignore
        const query = { ...nextSsrContext?.query, ...(req as NextApiRequest)?.query }
        const params = { ...restParams, ...nextSsrContext?.params, ...context, ...ctx?.params } // @ts-ignore
        const cookies = nextSsrContext?.req?.cookies || req?.cookies || ctx?.cookies
        const relatedArgs = apiParamKeys ? getApiParams(apiParamKeys, { query, params, body, args, context }) : {} // prettier-ignore
        const normalizedArgs = parseUrlParamsObject(relatedArgs)
        
        // -- Context --

        // Build config from all possible sources
        const config = {
            ...restParams,
            ...context,
            logErrors,
            respondErrors,
            onError,
            allowFail,
            cookies,
            method,
            parent,
            info,
            ...ctx?.config,
        }

        // Context normalization
        const headerContext = getHeaderContext(req)
        const fullContext = { ...headerContext, ...config, req: config.req || req } // Always override header context with config
        
        // -- Helpers --

        const parseArgs = (args: ArgsInput) => inputSchema.parse(args) as ArgsInput
        const formatOutput = (
            response: ResInput,
            formatOptions?: ApplyDefaultsOptions
        ) => {
            return outputSchema.applyDefaults(
                response as any$Ignore,
                formatOptions,
            ) as ResOutput
        }
        const withDefaults = (response: ResInput) => formatOutput(response, {
            stripSensitive: true,
            stripUnknown: true,
        })

        // -- Execute --

        return resolverFn({
            req: fullContext.req,
            res,
            args: normalizedArgs as ArgsInput,
            context: fullContext,
            config,
            parseArgs,
            withDefaults,
            formatOutput,
            tryCatch,
            Args: undefined as ArgsInput,
            Input: undefined as ArgsInput,
            Output: undefined as ResInput,
            Data: undefined as unknown as Partial<ResInput>,
        }) as unknown as Promise<ResOutput>
    }

    // -- Return Resolver --

    return Object.assign(resolverWrapper, {
        argSchema: inputSchema,
        resSchema: outputSchema,
        _input: undefined as ArgsInput,
        _output: undefined as ResOutput,
        isMutation,
    })
}
