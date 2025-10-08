// @ts-ignore
import { v4 as uuidV4 } from 'uuid'
import { z, schema } from '@green-stack/schemas'

/* --- Schema ---------------------------------------------------------------------------------- */

export const MockDBEntity = schema('MockDBEntity', {
    id: z
        .string()
        .uuid()
        .default(() => uuidV4())
        .describe('Provided or auto-generated UUID (V4)'),
    createdAt: z
        .date()
        .default(() => new Date())
        .describe('Creation date'),
    modifiedAt: z
        .date()
        .default(() => new Date())
        .describe('Last modified date'),
})

/* --- Types ----------------------------------------------------------------------------------- */

export type MockDBEntity<
    Z extends z.ZodObject<z.ZodRawShape> = typeof MockDBEntity
> = Prettify<z.input<Z>>
