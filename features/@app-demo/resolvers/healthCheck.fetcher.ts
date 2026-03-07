import type { HealthCheckInput, HealthCheckOutput } from './healthCheck.bridge'
import { appConfig } from '@app/config'

/** --- healthCheckFetcher() ------------------------------------------------------------------- */
/** -i- Isomorphic fetcher for our healthCheck() resolver at '/api/health' */
export const healthCheckFetcher = async (args: HealthCheckInput) => {
    const response = await fetch(`${appConfig.backendURL}/api/health?echo=${args.echo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })
    const data = await response.json()
    return data as HealthCheckOutput
}
