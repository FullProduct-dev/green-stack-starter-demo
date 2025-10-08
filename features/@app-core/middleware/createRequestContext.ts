import { NextRequest, NextResponse } from 'next/server'

/* --- Types ----------------------------------------------------------------------------------- */

export type RequestContext = {
    // -i- Next.js app API router request and response objects
    req: NextRequest,
    res: NextResponse,
    requestUrl?: string,
    // -i- Geolocation info
    geolocation?: {
        ip?: string,
        country?: string,
        city?: string,
    },
    // -i- GraphQL context properties
    parent?: unknown,
    info?: unknown,
    // -i- Anything else you might want to attach as context through middleware, e.g.
    userId?: string,
    orgId?: string,
    sessionId?: string,
    authToken?: string,
    // ...
}

export type CreateRequestContextArgs = Partial<Omit<RequestContext, 'req' | 'res'>> & {
    req: NextRequest,
    res?: NextResponse,
}

/** --- createRequestContext() ----------------------------------------------------------------- */
/** -i- Server-only util for Next.js API routes and graphql to add more context to requests for resolvers to use */
export const createRequestContext = async (baseContext: CreateRequestContextArgs): Promise<RequestContext> => {
    // Inputs
    const { req, res = new NextResponse(), ...restContext } = baseContext

    // -- Custom context retrieval --

    // TODO: Add custom context retrieval here
    // e.g. Parse header info
    // e.g. Verify JWT / user session

    // -- Return --

    return {
        // -i- Next.js app API router request and response objects
        req,
        res,
        // -i- GraphQL context properties?
        ...restContext,
        // -i- Anything else you might want to attach as context through middleware, e.g.
        // user: ...
        // permissions: ...
    }
}
