import * as RNSVG from 'react-native-svg'
import { colorScheme, cssInterop } from 'nativewind'
import { extractCssVar, getThemeColor, THEME_COLOR_KEYS } from '@green-stack/utils/styleUtils'
import { z, schema } from '../schemas'

/* --- Nativewind Support ---------------------------------------------------------------------- */

export const Svg = cssInterop(RNSVG.Svg, {
    className: {
        target: 'style',
        nativeStyleToProp: { width: true, height: true }
    },
})

// @ts-ignore
export const Path = cssInterop(RNSVG.Path, {
    className: {
        // @ts-ignore
        target: 'style',
        // @ts-ignore
        nativeStyleToProp: { fill: true, color: true, stroke: true }
    }
})

export const Circle = cssInterop(RNSVG.Circle, {})

export const Ellipse = cssInterop(RNSVG.Ellipse, {})

export const Line = cssInterop(RNSVG.Line, {})

export const Rect = cssInterop(RNSVG.Rect, {})

export const Text = cssInterop(RNSVG.Text, {})

/* --- Schemas --------------------------------------------------------------------------------- */

const IconPropsBase = schema('IconProps', {
    size: z.number().optional().describe('Icon size in pixels, encapsulates both width and height'),
    fill: z.string().optional().describe('Icon fill color, can also use the color prop'),
    color: z.string().optional().describe('Icon color, can also use the fill prop'),
    stroke: z.string().optional().describe('Icon stroke color to use, if stroke is needed'),
    className: z.string().optional().describe('Icon class name, transformed through nativewind cssInterop'),
    style: z.record(z.unknown()).optional().describe('Icon styles, combined with nativewind className'),
})

/** --- iconProps() ---------------------------------------------------------------------------- */
/** -i- Builds the iconProps schema and attaches a util to extract the color from className */
export const iconProps = <S extends z.ZodRawShape>(iconName: string, override?: S) => {
    // Schema
    const IconProps = IconPropsBase.extendSchema(
        iconName,
        override || {}
    ) as z.ZodObject<typeof IconPropsBase['shape'] & S>
    // Utils
    const getIconColor = (props: SvgProps & z.infer<typeof IconPropsBase>, log = false): string => {
        const defaults = IconProps.applyDefaults(props as any$Todo)
        // Check for color in props, className transformed styles
        const extractColor = () => {
            if (props.fill) return props.fill
            if (props.color) return props.color // @ts-ignore
            if (props.style?.color) return props.style.color // @ts-ignore
            if (Array.isArray(props.styles) && props.styles?.[0]?.color) return props.styles[0].color
        }
        const color = extractColor()
        // if (log) console.warn({ color, colorScheme: colorScheme.get() })
        // Transform theme colors
        if (color.includes('--')) {
            const cssVar = extractCssVar(color)
            if (cssVar) return getThemeColor(cssVar as THEME_COLOR_KEYS)
        }
        // Return color
        return defaults.fill || defaults.color || ''
    }
    // Return
    return Object.assign(IconProps, { getIconColor })
}

/* --- Types ----------------------------------------------------------------------------------- */

export type SvgProps = RNSVG.SvgProps

export const IconProps = iconProps('IconProps')

export type IconProps<
    Z extends { '_input': any$Unknown } = typeof IconProps,
    T = Z['_input']
> = SvgProps & T

/* --- Re-exports ------------------------------------------------------------------------------ */

export { z, getThemeColor }
