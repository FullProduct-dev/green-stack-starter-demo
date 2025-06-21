import { appConfig } from '@app/config'
import type { Metadata as NextMetadata } from 'next/types'

/** --- createMetadata() ----------------------------------------------------------------------- */
/** -i- https://nextjs.org/docs/app/api-reference/functions/generate-metadata#metadata-fields */
/** -i- Prefills some overwriteable metadata from your `@app/config` at `appConfig.ts` */
export const createMetadata = (ctx: NextMetadata) => ({
    title: ctx.title || appConfig.title || appConfig.openGraph?.title,
    description: ctx.description || appConfig.description || appConfig.openGraph?.description,
    openGraph: {
        title: appConfig.title || appConfig.openGraph?.title,
        description: appConfig.openGraph?.description,
        url: appConfig.openGraph?.url,
        siteName: appConfig.openGraph?.siteName,
        ...ctx.openGraph,
    },
    ...ctx,
})
