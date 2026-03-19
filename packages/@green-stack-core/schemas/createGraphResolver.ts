import type { AnyZodSchema, SchemaInput, SchemaOutput } from './schemas.compat'
import type { RequestContext } from '@app/middleware/createRequestContext'
 
/** --- createGraphResolver() ------------------------------------------------------------------ */
/** -i- Codegen: Build a graphQL resolver from a schema resolver */
export const createGraphResolver = <
    InputSchema extends AnyZodSchema,
    OutputSchema extends AnyZodSchema,
    ArgsInput = SchemaInput<InputSchema>,
    ResOutput = SchemaOutput<OutputSchema>,
>(
    resolver: ((input: { args: ArgsInput, context: RequestContext }) => Promise<ResOutput>) & {
        inputSchema: InputSchema,
        outputSchema: OutputSchema,
        isMutation?: boolean
    },
) => {
    const wrappedResolver = async (parent: unknown, { args }: { args: ArgsInput }, context: RequestContext, info: unknown) => {
        return resolver({ args, context: { ...context, parent, info } })
    }
    return Object.assign(wrappedResolver, {
        inputSchema: resolver.inputSchema,
        outputSchema: resolver.outputSchema,
        _input: undefined as ArgsInput,
        _output: undefined as ResOutput,
        isMutation: resolver.isMutation,
    })
}
