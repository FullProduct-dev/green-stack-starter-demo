import { z } from '@green-stack/schemas'

/* --- DB Driver Shape ------------------------------------------------------------------------- */

// -i- Validation that a given module is a DB Driver, by checking for the presence of specific properties
export const DbDriverShape = z.object({

    // -i- The ability to create a database model / collection from a Zod schema
    createSchemaModel: z.function().args(
        z.instanceof(z.ZodObject<z.ZodRawShape>),
        z.string().optional(),
    ),

    // -i- The base DB entity class that all models can extend from
    DBEntity: z.instanceof(z.ZodObject<z.ZodRawShape>),

})

/* --- Types ----------------------------------------------------------------------------------- */

export type DbDriverShape = z.infer<typeof DbDriverShape>
