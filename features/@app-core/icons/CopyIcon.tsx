import { Svg, Path, z, iconProps, IconProps, getThemeColor } from '@green-stack/svg'

/* --- Types ----------------------------------------------------------------------------------- */

export const CopyIconProps = iconProps('CopyIcon', {
    color: z.string().default(getThemeColor('--primary', 'light')),
})

export type CopyIconProps = IconProps<typeof CopyIconProps>

/* --- <CopyIcon/> -------------------------------------------------------------------------- */

export const CopyIcon = (rawProps: CopyIconProps) => {
    // Props
    const props = CopyIconProps.applyDefaults(rawProps)
    const color = CopyIconProps.getIconColor(props, true)
    // Render
    return (
        <Svg
            width={props.size}
            height={props.size}
            fill="none"
            viewBox="0 0 24 24"
            {...props}
        >
            <Path
                stroke={color}
                fill="none"
                d="M8 6V3C8 2.45 8.45 2 9 2H20C20.55 2 21 2.45 21 3V17C21 17.55 20.55 18 20 18H16V7C16 6.45 15.55 6 15 6H8Z"
                clipRule="evenodd"
                fillRule="evenodd"
            />
            <Path
                stroke={color}
                fill="none"
                d="M15 22H4C3.45 22 3 21.55 3 21V7C3 6.45 3.45 6 4 6H15C15.55 6 16 6.45 16 7V21C16 21.55 15.55 22 15 22Z"
                clipRule="evenodd"
                fillRule="evenodd"
            />
        </Svg>
    )
}
