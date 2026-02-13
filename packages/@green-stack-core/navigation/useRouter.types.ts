
export type UniversalRouterMethods = {
    /** Navigate to the provided href, uses a push operation on mobile if possible. */
    push: (href: string) => void

    /** Navigate to the provided href. */
    navigate: (href: string) => void

    /** Navigate to route without appending to the history. */
    replace: (href: string) => void

    /** Go back in the history. */
    back: () => void

    /** If there's history that supports invoking the `back` function. */
    canGoBack: () => boolean

    /** Update the current route query params. */
    setParams: (params?: Record<string, any$Unknown>, options?: { shallow?: boolean }) => void
}
