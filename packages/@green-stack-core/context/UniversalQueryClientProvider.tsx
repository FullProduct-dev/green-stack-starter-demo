"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

/* --- Constants ------------------------------------------------------------------------------- */

let clientSideQueryClient: QueryClient | undefined = undefined

/** --- makeQueryClient() ---------------------------------------------------------------------- */
/** -i- Build a queryclient to be used either client-side or server-side */
export const makeQueryClient = () => {
    const oneMinute = 1000 * 60
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                // With SSR, we usually want to set some default staleTime
                // above 0 to avoid refetching immediately on the client
                staleTime: oneMinute,
            },
        },
    })
    return queryClient
}

/** --- getQueryClient() ----------------------------------------------------------------------- */
/** -i- Always makes a new query client on the server, but reuses an existing client if found in browser or mobile */
export const getQueryClient = () => {
    // Always create a new query client on the server, so no caching is shared between requests
    const isServer = typeof window === 'undefined'
    if (isServer) return makeQueryClient()
    // On the browser or mobile, make a new client if we don't already have one
    // This is important so we don't re-make a new client if React suspends during initial render.
    // Might not be needed if we have a suspense boundary below the creation of the query client though.
    if (!clientSideQueryClient) clientSideQueryClient = makeQueryClient()
    return clientSideQueryClient
}

/** --- <UniversalQueryClientProvider/> ----------------------------------------------------------------- */
/** -i- Provides a universal queryclient to be used either client-side or server-side */
export const UniversalQueryClientProvider = ({ children }: { children: React.ReactNode }) => {
    const queryClient = getQueryClient()
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}
