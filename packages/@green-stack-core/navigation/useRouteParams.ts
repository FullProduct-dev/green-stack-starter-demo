import { useContext } from 'react'
import { CoreContext } from '../context/CoreContext'
import { UniversalRouteScreenProps, UseRouteParamsOptions } from './useRouteParams.types'

/* --- useRouteParams() ------------------------------------------------------------------------ */

export const useRouteParams = (routeScreenProps: UniversalRouteScreenProps, options?: UseRouteParamsOptions) => {
    const { useContextRouteParams } = useContext(CoreContext)
    return useContextRouteParams(routeScreenProps, options)
}
