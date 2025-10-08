'use client'
import React from 'react'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import UniversalAppProviders from '@app/screens/UniversalAppProviders'
import { Image as NextContextImage } from '@green-stack/core/components/Image.next'
import { Link as NextContextLink } from '@green-stack/core/navigation/Link.next'
import { useRouter as useNextContextRouter } from '@green-stack/navigation/useRouter.next'
import { useRouteParams as useNextRouteParams } from '@green-stack/navigation/useRouteParams.next'
import { isServer } from '@app/config'

// -i- This is a regular react client component
// -i- It's still rendered on the server during SSR, but it also hydrates on the client
// -i- That makes this file a good place to do "client-only" things for web:
// -i- like rendering our universal apps providers (supported during SSR in client components)

/* --- Types ----------------------------------------------------------------------------------- */

type NextClientRootLayoutProps = {
    children: React.ReactNode
    requestContext?: Record<string, any$TooComplex>
}

/* --- <NextClientRootLayout/> ---------------------------------------------------------------- */

const NextClientRootLayout = ({ children, requestContext }: NextClientRootLayoutProps) => {
    
    // Navigation
    const nextContextRouter = useNextContextRouter()

    // -- Render --
    
    return (
        <SafeAreaProvider
            initialMetrics={{
                frame: { x: 0, y: 0, width: 0, height: 0 },
                insets: { top: 0, right: 0, bottom: 0, left: 0 },
            }}
        >
            <UniversalAppProviders
                contextImage={NextContextImage}
                contextLink={NextContextLink}
                contextRouter={nextContextRouter}
                useContextRouteParams={useNextRouteParams}
                requestContext={isServer ? requestContext : {}}
                isNext
            >
                {children}
            </UniversalAppProviders>
        </SafeAreaProvider>
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default NextClientRootLayout
