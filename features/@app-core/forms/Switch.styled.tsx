import { forwardRef, ElementRef } from 'react'
import { Platform } from 'react-native'
import * as SP from '@green-stack/forms/Switch.primitives'
import { cn, getThemeColor, View, Text, Pressable } from '../components/styled'
import { z, schema, PropsOf } from '@green-stack/schemas'
import { useColorScheme } from 'nativewind'
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated'
import { useFocusedPress } from '@green-stack/hooks/useFocusedPress'

/* --- Props ----------------------------------------------------------------------------------- */

export const SwitchProps = schema('SwitchProps', {
    checked: z.boolean().default(false),
    label: z.string().optional(),
    disabled: z.boolean().default(false),
    hasError: z.boolean().default(false),
    className: z.string().optional(),
    switchClassName: z.string().optional(),
    switchThumbClassName: z.string().optional(),
    labelClassName: z.string().optional(),
    hitSlop: z.number().default(6),
})

export type SwitchProps = PropsOf<typeof SP['SwitchRoot'], typeof SwitchProps>

/* --- <SwitchWeb/> ---------------------------------------------------------------------------- */

export const SwitchWeb = forwardRef<
    ElementRef<typeof SP['SwitchRoot']>,
    SwitchProps
>((rawProps, ref) => {
    // Props
    const props = SwitchProps.applyDefaults(rawProps)
    const { checked, disabled, label, hasError, onCheckedChange } = props

    // -- Handlers --

    const onPress = disabled ? () => {} : () => onCheckedChange(!checked)

    const focusedKeyHandlerProps = useFocusedPress(['Enter', ' '], () => onPress())

    // -- Render --

    return (
        <Pressable
            className={cn(
                'flex-row items-center',
                props.className,
            )}
            {...focusedKeyHandlerProps}
            onPress={onPress}
            disabled={disabled}
        >
            <SP.SwitchRoot
                ref={ref}
                {...props}
                className={cn(
                    'peer flex-row h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    'disabled:cursor-not-allowed',
                    checked ? 'bg-success' : 'bg-input',
                    checked && hasError && 'bg-danger',
                    disabled && 'opacity-50',
                    hasError && 'border-danger',
                    props.switchClassName,
                )}
                asChild
            >
                <Pressable disabled={disabled}>
                    <SP.SwitchThumb
                        className={cn(
                            'pointer-events-none block h-5 w-5 rounded-full bg-background ring-0 transition-transform',
                            'web:shadow-md web:shadow-foreground/5',
                            checked ? 'translate-x-5' : 'translate-x-0',
                            props.switchThumbClassName,
                        )}
                        asChild
                    >
                        <View />
                    </SP.SwitchThumb>
                </Pressable>
            </SP.SwitchRoot>
            {label && (
                <Text
                    className={cn(
                        'ml-2 text-sm text-primary select-none',
                        props.labelClassName,
                    )}
                    disabled={disabled}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    )
})

SwitchWeb.displayName = 'SwitchWeb'

/* --- <SwitchNative/> ------------------------------------------------------------------------- */

const RGB_COLORS = {
    light: {
        primary: getThemeColor('--primary', 'light'),
        input: getThemeColor('--input', 'light'),
    },
    dark: {
        primary: getThemeColor('--primary', 'dark'),
        input: getThemeColor('--input', 'dark'),
    },
} as const

export const SwitchNative = forwardRef<
    ElementRef<typeof SP['SwitchRoot']>,
    SwitchProps
>((rawProps, ref) => {
    // Props
    const props = SwitchProps.applyDefaults(rawProps)
    const { checked, disabled, label, hasError, onCheckedChange } = props

    // -- Animations --

    const { colorScheme } = useColorScheme()
    const translateX = useDerivedValue(() => (props.checked ? 18 : 0))

    const animatedRootStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            translateX.value,
            [0, 18],
            [RGB_COLORS[colorScheme!].input, RGB_COLORS[colorScheme!].primary]
        ),
    }))

    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: withTiming(translateX.value, { duration: 200 }) }],
    }))

    // -- Render --

    return (
        <Pressable
            className={cn(
                'flex flex-row items-center',
                props.className,
            )}
            onPress={() => onCheckedChange(!checked)}
            disabled={disabled}
        >
            <Animated.View
                style={animatedRootStyle}
                className={cn('h-8 w-[46px] rounded-full', props.disabled && 'opacity-50')}
            >
                <SP.SwitchRoot
                    ref={ref}
                    {...props}
                    className={cn(
                        'flex-row h-8 w-[46px] shrink-0 items-center rounded-full border-2 border-transparent',
                        props.checked ? 'bg-success' : 'bg-input',
                        props.checked && props.hasError && 'bg-danger',
                        props.switchClassName,
                    )}
                    asChild
                >
                    <View>
                        <Animated.View style={animatedThumbStyle}>
                            <SP.SwitchThumb
                                className={cn(
                                    'h-7 w-7 rounded-full bg-background shadow-md shadow-foreground/25 ring-0',
                                    props.switchThumbClassName,
                                )}
                                asChild
                            >
                                <View />
                            </SP.SwitchThumb>
                        </Animated.View>
                    </View>
                </SP.SwitchRoot>
            </Animated.View>
            {label && (
                <Text
                    className={cn(
                        'ml-2 text-sm text-primary select-none',
                        props.labelClassName,
                    )}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    )
})

SwitchNative.displayName = 'SwitchNative'

/* --- <Switch/> ------------------------------------------------------------------------------- */

export const Switch = Platform.select({
    web: SwitchWeb,
    native: SwitchNative,
    macos: SwitchNative,
    windows: SwitchNative,
    ios: SwitchNative,
    android: SwitchNative,
})

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = SwitchProps.documentationProps('Switch', {
    exampleProps: { checked: true },
    valueProp: 'checked',
    onChangeProp: 'onCheckedChange',
})
