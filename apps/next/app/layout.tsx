/* @jsxImportSource react */
import NextServerRootLayout from './NextServerRootLayout'
import { createMetadata } from '@app/utils/server/metadata'
import { appConfig } from '@app/config'

/* --- Web Default Metadata -------------------------------------------------------------------- */

export const metadata = createMetadata({
    metadataBase: new URL(appConfig.baseURL),
    title: appConfig.title || appConfig.appName,
    description: appConfig.description || appConfig.appDescription,
    openGraph: {
        title: appConfig.openGraph.title || appConfig.title || appConfig.appName,
        description: appConfig.openGraph.description || appConfig.description || appConfig.appDescription,
        url: appConfig.openGraph.url || appConfig.baseURL,
        siteName: appConfig.openGraph.siteName || appConfig.title || appConfig.appName,
    }
})

/* --- Web Root Layout ------------------------------------------------------------------------- */

// -i- We render the server layout as a react server component first
// -i- This includes the document / html skeleton & styles for SSR
// -i- Inside the server layout, we'll render the client layout with e.g. our app providers

export default NextServerRootLayout
