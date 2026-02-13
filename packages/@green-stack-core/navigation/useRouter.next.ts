import { useRouter as useNextRouter } from 'next/navigation'
import { UniversalRouterMethods } from './useRouter.types'
import { buildUrlParamsObject } from '../utils/objectUtils'
import { isEmpty } from '../utils/commonUtils'
import { SHALLOW_PARAMS_CHANGE_EVENT } from './searchParamsStore'

/* --- useRouter() -------------------------------------------------------------------- */

export const useRouter = () => {
    // Hooks
    const nextRouter = useNextRouter()

    // -- Helpers --

    const push = (href: string) => nextRouter.push(href)

    const navigate = (href: string) => nextRouter.push(href)

    const replace = (href: string) => nextRouter.replace(href)

    const canGoBack = () => {
        if (typeof window === 'undefined') return true
        return window.history.length > 1
    }

    const setParams = (
        params: Record<string, any$Unknown> = {},
        options: { shallow?: boolean} = {},
    ) => {
        const { shallow = false } = options
        if (typeof window === 'undefined') return
        const url = new URL(window.location.href)
        const search = new URLSearchParams()
        const newParams = buildUrlParamsObject(params)
        Object.keys(newParams).forEach((key) => {
            const paramVal = newParams[key]
            if (!isEmpty(paramVal)) search.set(key, paramVal)
        })
        url.search = search.toString()
        if (!shallow) nextRouter.replace(url.toString(), { scroll: false })
        else {
            window?.history?.replaceState(window.history.state, '', url.toString())
            window?.dispatchEvent(new CustomEvent(SHALLOW_PARAMS_CHANGE_EVENT))
        }
    }

    // -- Return --

    return {
        push,
        navigate,
        replace,
        back: nextRouter.back,
        canGoBack,
        setParams,
    } as UniversalRouterMethods
}
