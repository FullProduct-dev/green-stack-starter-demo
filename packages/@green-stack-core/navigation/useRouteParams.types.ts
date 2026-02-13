
export type UniversalRouteScreenProps = Record<string, unknown> & {
    params?: Record<string, unknown>
    searchParams?: Record<string, unknown>
}

export type UseRouteParamsOptions = {
    /** When `true`, the hook subscribes to shallow URL changes (via `router.setParams(..., { shallow: true })`)
     ** and re-renders the component when search params change.
     ** On Expo, `useLocalSearchParams()` is already reactive, so this option has no effect.
     ** @default true */
    reactive?: boolean
}
