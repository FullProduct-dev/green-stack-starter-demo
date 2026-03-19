import * as OS from 'os'
import type { NextRequest } from 'next/server'
import { createResolver } from '@green-stack/schemas/createResolver'
import { appConfig } from '@app/config'
import { healthCheckBridge } from './healthCheck.bridge'
import { Settings } from '@db/models'
import { DRIVER_KEYS } from '@app/registries/drivers.config'

/* --- Constants ------------------------------------------------------------------------------- */

const ALIVE_SINCE = new Date()

/** --- Test Links ----------------------------------------------------------------------------- */
/** -i- http://localhost:3000/api/health */

/** --- healthCheck() -------------------------------------------------------------------------- */
/** -i- Check the health status of the server. Includes relevant urls, server time(zone), versions and more */
export const healthCheck = createResolver(async ({ args, withDefaults, req, context }) => {
    
    // Inputs
    const { echo, verbose } = args

    // Context
    const { req: _, res: __, ...headerContext } = context

    // Vars
    const now = new Date()
    const aliveTime = now.getTime() - ALIVE_SINCE.getTime()

    // Urls
    const r = req as Request
    const rn = req as NextRequest
    const requestHost = rn?.headers?.get?.('host')
    const requestProtocol = rn?.headers?.get?.('x-forwarded-proto') ?? 'http'
    const requestUrlFallback = `${requestProtocol}://${requestHost}/api/health`
    const requestURL = r?.url || headerContext.requestUrl || requestUrlFallback
    const { baseURL, backendURL, apiURL, graphURL } = appConfig

    // -- Context --

    const extraContext = { requestContext: headerContext, drivers: {} } as ObjectType<any$Unknown>

    const addDriverStatus = (
        driverName: DRIVER_KEYS,
        driverType = 'UNKNOWN',
        status: 'OK' | 'NOK' | 'NONE',
    ) => {
        extraContext.drivers[driverName] = {
            type: driverType,
            status,
        }
    }

    // -- Test DB Driver --

    try {

        const hasDbDriverSetting = !!(await Settings.findMany({ key: 'dbDriver' })).length
        
        if (!hasDbDriverSetting) {
            await Settings.createOne({
                key: 'dbDriver',
                value: appConfig.drivers.db,
            })
        }

        const dbDriverSetting = await Settings.findOne({ key: 'dbDriver' })
        const dbDriverValue = dbDriverSetting?.value || 'NONE'
        addDriverStatus('db', dbDriverValue, dbDriverValue ? 'OK' : 'NOK')

    } catch (error) {

        console.error('Error testing DB driver:', error)
        addDriverStatus('db', appConfig.drivers.db, 'NOK')

    }

    // -- Respond --

    return {
        // PARAMS
        echo,
        // STATUS
        status: 'OK',
        alive: true,
        kicking: true,
        // TIME & DATES
        now: now.toISOString(),
        aliveTime,
        aliveSince: ALIVE_SINCE.toISOString(),
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        // URLS
        requestHost,
        requestProtocol,
        requestURL,
        baseURL: requestHost ? `${requestProtocol}://${requestHost}` : baseURL,
        backendURL: requestHost ? `${requestProtocol}://${requestHost}` : backendURL,
        apiURL: requestHost ? `${requestProtocol}://${requestHost}/api` : apiURL,
        graphURL: requestHost ? `${requestProtocol}://${requestHost}/api/graphql` : graphURL,
        port: process.env.PORT ? Number(process.env.PORT) : null,
        debugPort: process.debugPort && Number(process.debugPort),
        // VERSIONS
        nodeVersion: process.versions.node,
        v8Version: process.versions.v8,
        // SYSTEM
        systemArch: OS.arch(),
        systemPlatform: OS.platform(),
        systemRelease: OS.release(),
        systemFreeMemory: OS.freemem(),
        systemTotalMemory: OS.totalmem(),
        systemLoadAverage: OS.loadavg(),
        // CONTEXT
        context: verbose ? extraContext : undefined,
    }
}, healthCheckBridge)
