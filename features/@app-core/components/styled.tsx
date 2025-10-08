import resolveConfig from 'tailwindcss/resolveConfig'
import tailwindConfig from '../tailwind.config'
import type { KnownRoutes } from '@app/registries/routeManifest.generated'
import {
    Text as RNText,
    View as RNView,
    Pressable as RNPressable,
    ScrollView as RNScrollView,
    KeyboardAvoidingView as RNKeyboardAvoidingView,
} from 'react-native'
import { Link as UniversalLink } from '@green-stack/navigation/Link'
import { UniversalLinkProps } from '@green-stack/navigation/Link.types'
import { Image as UniversalImage } from '@green-stack/components/Image'
import { styled, cn, getThemeColor } from '@green-stack/styles'
import { remapProps } from 'nativewind'

/* --- Reexports ------------------------------------------------------------------------------- */

export { styled, cn, getThemeColor }

/* --- Theme ----------------------------------------------------------------------------------- */

export const { theme } = resolveConfig(tailwindConfig)

/* --- Primitives ------------------------------------------------------------------------------ */

export const View = styled(RNView, '')
export const Text = styled(RNText, 'text-primary')
export const Image = styled(UniversalImage, '')
export const Pressable = styled(RNPressable, '')

/* --- React-Native ---------------------------------------------------------------------------- */

export const ScrollView = remapProps(styled(RNScrollView), {
    contentContainerClassName: 'contentContainerStyle',
})

export const KeyboardAvoidingView = styled(RNKeyboardAvoidingView, '')

/* --- Flexbox --------------------------------------------------------------------------------- */

export const Row = styled(View, 'relative flex flex-row')
export const Col = styled(View, 'relative flex flex-col')

/* --- Typography ------------------------------------------------------------------------------ */

export const H1 = styled(RNText, 'text-primary font-bold text-3xl')
export const H2 = styled(RNText, 'text-secondary font-bold text-xl')
export const H3 = styled(RNText, 'text-primary font-bold text-lg')

export const P = styled(RNText, 'text-primary text-base')

/* --- Fix for Next Link ----------------------------------------------------------------------- */

export const Link = <HREF extends KnownRoutes>(props: UniversalLinkProps<HREF>) => {
    const StyledLink = styled(UniversalLink, '') // @ts-ignore
    return <StyledLink {...props} />
}

export const LinkText = styled(RNText, 'text-link underline')

/* --- Text Links ------------------------------------------------------------------------------ */

export type TextLinkProps = Omit<React.ComponentProps<typeof UniversalLink<string>>, 'className'> & {
    className?: string
}

export const TextLink = (props: TextLinkProps) => {
    const { className, style, children, ...universalLinkProps } = props
    return (
        <LinkText className={className} style={style}>
            <UniversalLink {...universalLinkProps}>
                {children}
            </UniversalLink>
        </LinkText>
    )
}
