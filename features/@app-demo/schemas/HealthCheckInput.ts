import { z, schema } from '@green-stack/schemas'

/* --- Schemas --------------------------------------------------------------------------------- */

export const HealthCheckInput = schema('HealthCheckInput', {
   echo: z.string().default('Hello World'),
   verbose: z.boolean().default(false),
})

/* --- Type Alias ------------------------------------------------------------------------------ */

export type HealthCheckInput = z.infer<typeof HealthCheckInput>
