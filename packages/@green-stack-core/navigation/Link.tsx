"use client"
import type { KnownRoutes } from '@app/registries/routeManifest.generated'
import type { UniversalLinkProps } from './Link.types'
import React from 'react'
import { CoreContext } from '../context/CoreContext'

/* --- <Link/> --------------------------------------------------------------------------------- */

export const Link = <HREF extends KnownRoutes>(props: UniversalLinkProps<HREF>) => {
    // Context
    const { contextLink: ContextLink } = React.useContext(CoreContext)

    // @ts-ignore
    return <ContextLink {...props} />
}

