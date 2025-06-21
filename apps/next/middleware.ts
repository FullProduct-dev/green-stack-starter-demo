import { NextRequest, NextResponse } from 'next/server'
import { createMiddlewareContext } from '@green-stack/utils/apiUtils'
import type { RequestContext } from '@app/core/middleware/createRequestContext'

/* --- Middleware ------------------------------------------------------------------------------ */

// -i- https://nextjs.org/docs/app/api-reference/functions/next-request
export const middleware = async (req: NextRequest) => {

    // Calculate geolocation (vercel only)
    const vercelReqIP = req.headers.get('x-real-ip') || undefined
    const vercelReqGeo = req.headers.get('x-vercel-ip-country') || undefined
    const vercelReqCity = req.headers.get('x-vercel-ip-city') || undefined
    const hasGeo = vercelReqGeo && vercelReqCity
    const geolocation = { ip: vercelReqIP, country: vercelReqGeo, city: vercelReqCity }

    // Create the request context header (to pass things like auth, user, etc. to the API)
    const headerContext: Partial<RequestContext> = {
        requestUrl: req.nextUrl.href,
        geolocation: hasGeo ? geolocation : undefined,
        // TODO: add any JSON serializable data you'd kuje to pass to the APIs here
        // ...
    }
    
    // Add any headers you'd like to always be present on requests that passed through this middleware
    const extraHeaders = {
        // e.g. 'x-api-key': appConfig.apiKey
    }

    // Execute the request handler (and pass the request context header)
    const res = NextResponse.next({
        request: {
            headers: await createMiddlewareContext(req, headerContext, extraHeaders),
        },
    })

    // Allow CORS for /api routes
    if (req.nextUrl.pathname.startsWith('/api')) {
        res.headers.append('Access-Control-Allow-Origin', '*')
        res.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        res.headers.append('Access-Control-Allow-Headers', 'Content-Type')
    }

    // Continue by resolving the request
    return res
}

/* --- Config ---------------------------------------------------------------------------------- */

export const config = {
    matcher: [
        '/((?!.+\\.[\\w]+$|_next).*)',
        '/',
        '/(api|graphql|trpc)(.*)',
    ],
}
