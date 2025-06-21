import { View as RNView } from 'react-native'
import { z, iconProps } from '@green-stack/core/svg/svg.primitives'
import { REGISTERED_ICONS } from '@app/registries/icons.registry'
import { Image } from './Image'
import { cn, styled } from '../styles'

/* --- Constants ------------------------------------------------------------------------------- */

const ICON_KEYS = Object.keys(REGISTERED_ICONS) as [REGISTERED_ICONS, ...REGISTERED_ICONS[]]

/* --- Styles ---------------------------------------------------------------------------------- */

const View = styled(RNView, '')

/* --- Types ----------------------------------------------------------------------------------- */

export const UniversalIconProps = iconProps('UniversalIconProps', {
    name: z.enum(ICON_KEYS).describe('Name of an icon registered in the icon registry'),
    url: z.string().url().optional().describe('Icon URL, for remote .svg or image icons'),
})

export type UniversalIconProps = z.infer<typeof UniversalIconProps>

/* --- <UniversalIcon/> ------------------------------------------------------------------------ */

export const UniversalIcon = (rawProps: UniversalIconProps) => {
    // Props
    const props = UniversalIconProps.applyDefaults(rawProps)
    const { name, url } = props

    // -- Image Icons --

    if (url) {
        return (
            <Image
                src={url}
                alt={name}
                className={props.className}
                width={props.size}
                height={props.size}
                style={props.style}
            />
        )
    }

    // -- No Icon? --

    const RegisteredIcon = REGISTERED_ICONS[name]

    if (!name || !RegisteredIcon) return null

    // -- Registered Icons --

    return (
        <View
            className={cn('justify-center align-center', props.className)}
            style={{ width: props.size, height: props.size }}
        >
            <RegisteredIcon
                size={props.size}
                color={props.color}
                className={props.className}
                {...props}
            />
        </View>
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export { UniversalIcon as Icon }
