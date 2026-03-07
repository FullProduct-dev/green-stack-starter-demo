import { createGraphResolver } from '@green-stack/core/schemas/createGraphResolver'
import { createNextRouteHandler } from '@green-stack/core/schemas/createNextRouteHandler'
import { healthCheck } from '@app/demo/resolvers/healthCheck.resolver'

/* --- Routes ---------------------------------------------------------------------------------- */

export const GET = createNextRouteHandler(healthCheck)

export const POST = createNextRouteHandler(healthCheck)

/* --- GraphQL --------------------------------------------------------------------------------- */

// -i- Picked up by `npm run collect:resolvers` when running dev to add to list of resolvers
// -i- which `npm run build:schema` will later turn into new GraphQL schema definitions
export const graphResolver = createGraphResolver(healthCheck)
