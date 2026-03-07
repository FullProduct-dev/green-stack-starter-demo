import { z, schema } from '@green-stack/schemas'

/* --- Schemas --------------------------------------------------------------------------------- */

export const HealthCheckOutput = schema('HealthCheckOutput', {
    echo: z.string().optional(),
    status: z.literal('OK'),
    alive: z.boolean(),
    kicking: z.boolean(),
    now: z.string(),
    aliveTime: z.number(),
    aliveSince: z.date(),
    serverTimezone: z.string(),
    requestHost: z.string().optional(),
    requestProtocol: z.string().optional(),
    requestURL: z.string().optional(),
    baseURL: z.string().optional(),
    backendURL: z.string().optional(),
    apiURL: z.string().optional(),
    graphURL: z.string().optional(),
    port: z.number().int().nullable(),
    debugPort: z.number().int().nullable(),
    nodeVersion: z.string().optional(),
    v8Version: z.string().optional(),
    systemArch: z.string().optional(),
    systemPlatform: z.string().optional(),
    systemRelease: z.string().optional(),
    systemFreeMemory: z.number().optional(),
    systemTotalMemory: z.number().optional(),
    systemLoadAverage: z.array(z.number()).optional(),
    context: z.record(z.string(), z.unknown()).nullish(),
})

/* --- Type Alias ------------------------------------------------------------------------------ */

export type HealthCheckOutput = z.infer<typeof HealthCheckOutput>
