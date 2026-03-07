import { createDataBridge } from '@green-stack/schemas/createDataBridge'
import { HealthCheckInput } from '../schemas/HealthCheckInput'
import { HealthCheckOutput } from '../schemas/HealthCheckOutput'

/* --- Types ----------------------------------------------------------------------------------- */

export { HealthCheckInput, HealthCheckOutput }

/** --- Bridge --------------------------------------------------------------------------------- */
/** -i- Bundled meta for the healthCheck() resolver, reusable on server, browser & mobile */
export const healthCheckBridge = createDataBridge({
    resolverName: 'healthCheck',
    // resolverArgsName: 'HealthCheckInput',
    inputSchema: HealthCheckInput,
    outputSchema: HealthCheckOutput,
    apiPath: '/api/health',
    allowedMethods: ['GRAPHQL', 'GET'],
})
