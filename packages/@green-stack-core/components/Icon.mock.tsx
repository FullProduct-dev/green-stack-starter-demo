import { z, schema } from '@green-stack/core/schemas'
import { REGISTERED_ICONS } from '@app/registries/icons.registry'

/* --- Constants ------------------------------------------------------------------------------- */

const ICON_KEYS = Object.keys(REGISTERED_ICONS) as [REGISTERED_ICONS, ...REGISTERED_ICONS[]]

/* --- Types ----------------------------------------------------------------------------------- */

export const UniversalIconProps = schema('UniversalIconProps', {
    name: z.enum(ICON_KEYS).describe('Name of an icon registered in the icon registry'),
    url: z.string().url().optional().describe('Icon URL, for remote .svg or image icons'),
    size: z.number().optional().describe('Icon size in pixels, encapsulates both width and height'),
    fill: z.string().optional().describe('Icon fill color, can also use the color prop'),
    color: z.string().optional().describe('Icon color, can also use the fill prop'),
    stroke: z.string().optional().describe('Icon stroke color to use, if stroke is needed'),
    className: z.string().optional().describe('Icon class name, transformed through nativewind cssInterop'),
    style: z.record(z.unknown()).optional().describe('Icon styles, combined with nativewind className'),
})

export type UniversalIconProps = z.input<typeof UniversalIconProps>

/* --- <UniversalIcon/> ------------------------------------------------------------------------ */

export const UniversalIcon = (rawProps: UniversalIconProps) => <></>
