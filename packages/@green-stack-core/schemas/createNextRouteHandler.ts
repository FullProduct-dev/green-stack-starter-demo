import { NextResponse } from 'next/server'
import { getUrlParams } from '../utils/apiUtils'

/** --- createNextRouteHandler() --------------------------------------------------------------- */
/** -i- Codegen: Build next.js app dir api route from a schema resolver  */
export const createNextRouteHandler = (handler: any$Todo, parseBody = true) => {
    return async (req: Request, { params }: any$Todo) => {
        // Parse query params
        const query = getUrlParams(req.url)
        // Parse request params
        const reqParams = await params
        // Parse body?
        let args = { ...query, ...reqParams }
        if (parseBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
            const body = await req.json()
            args = { ...query, ...body, ...reqParams }
        }
        // Run handler & return response
        const res = await handler({ req, reqParams, args })
        // Handle custom response
        if (res instanceof Response) return res
        if (res instanceof NextResponse) return res
        // Return JSON response
        return NextResponse.json(res)
    }
}
