import { z } from '@green-stack/schemas'

/* --- Schema ---------------------------------------------------------------------------------- */

export const DbModelShape = z.object({
    insertOne: z.function().args(z.any()).returns(z.promise(z.any())),
    insertMany: z.function().args(z.array(z.any())).returns(z.promise(z.array(z.any()))),
    findOne: z.function().args(z.any()).returns(z.promise(z.any())),
    findMany: z.function().args(z.any()).returns(z.promise(z.array(z.any()))),
    updateOne: z.function().args(z.any(), z.any(), z.boolean().optional()).returns(z.promise(z.any())),
    updateMany: z.function().args(z.any(), z.any(), z.boolean().optional()).returns(z.promise(z.array(z.any()))),
    upsertOne: z.function().args(z.any(), z.any()).returns(z.promise(z.any())),
    deleteOne: z.function().args(z.any(), z.boolean().optional()).returns(z.promise(z.any())),
    deleteMany: z.function().args(z.any(), z.boolean().optional()).returns(z.promise(z.array(z.any()))),
})

/* --- Types ----------------------------------------------------------------------------------- */

export type DbModelShape = z.infer<typeof DbModelShape>

/** --- validateDriverModel() ----------------------------------------------------------------------- */
/** -i- Validates whether a DB model matches the expected methods */
export const validateDriverModel = <DB_MODEL extends DbModelShape>(model: DB_MODEL) => {
    DbModelShape.parse(model)
    return model
}
