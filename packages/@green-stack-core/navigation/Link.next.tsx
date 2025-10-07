import type { ComponentProps } from 'react'
import type { KnownRoutes } from '@app/registries/routeManifest.generated'
import type { UniversalLinkProps } from './Link.types'
import NextLink from 'next/link'
import { parseNativewindStyles } from '../styles/parseNativewindStyles'
import { cn } from '../utils/styleUtils'

/* --- <Link/> --------------------------------------------------------------------------------- */

export const Link = <HREF extends KnownRoutes>(props: UniversalLinkProps<HREF>) => {

    // Props
    const {
        children,
        href,
        params = {},
        className,
        style,
        replace,
        onPress,
        target,
        scroll,
        shallow,
        passHref,
        prefetch,
        locale,
        as,
    } = props

    // Vars
    const nativeID = props.id || props.nativeID

    // -- Inject params? --

    const finalHref = Object.keys(params).reduce((acc, key) => {
        // Inject into [param] in href?
        const isRouteParam = acc.includes(`[${key}]`)
        if (isRouteParam) return acc.replace(`[${key}]`, params[key])
        // Inject as query param instead?
        return `${acc}${acc.includes('?') ? '&' : '?'}${key}=${params[key]}`
    }, href)

    // -- Nativewind --

    const { nativeWindStyles, nativeWindClassName, restStyle } = parseNativewindStyles(style)
    const finalStyle = { ...nativeWindStyles, ...restStyle } as React.CSSProperties

    // -- Render --

    return (
        <NextLink
            href={finalHref}
            id={nativeID}
            className={cn(className, nativeWindClassName)}
            style={finalStyle as unknown as ComponentProps<typeof NextLink>['style']} 
            // @ts-ignore
            onClick={onPress}
            target={target}
            replace={replace}
            scroll={scroll}
            shallow={shallow}
            passHref={passHref}
            prefetch={prefetch}
            locale={locale}
            as={as}
        >
            {children}
        </NextLink>
    )
}
