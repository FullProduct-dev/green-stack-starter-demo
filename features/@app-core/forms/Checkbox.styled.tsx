import { forwardRef, ElementRef } from 'react'
import { CheckboxRoot, CheckboxIndicator } from '@green-stack/forms/Checkbox.primitives'
import { cn, View, Text, Pressable, getThemeColor } from '../components/styled'
import { z, schema, PropsOf } from '@green-stack/schemas'
import { Icon } from '@green-stack/components/Icon'
import { useFocusedPress } from '@green-stack/hooks/useFocusedPress'

/* --- Props ----------------------------------------------------------------------------------- */

export const CheckboxProps = schema('CheckboxProps', {
    checked: z.boolean().default(false),
    label: z.string().optional().eg('Label'),
    disabled: z.boolean().default(false),
    hasError: z.boolean().default(false),
    className: z.string().optional(),
    checkboxClassName: z.string().optional(),
    indicatorClassName: z.string().optional(),
    labelClassName: z.string().optional(),
    hitSlop: z.number().default(6),
})

export type CheckboxProps = PropsOf<typeof CheckboxRoot, typeof CheckboxProps>

/* --- <Checkbox/> ----------------------------------------------------------------------------- */

export const Checkbox = forwardRef<
    ElementRef<typeof CheckboxRoot>,
    CheckboxProps
>((rawProps, ref) => {
    
    // Props
    const props = CheckboxProps.applyDefaults(rawProps)
    const { checked, disabled, label, hasError, onCheckedChange } = props

    // Vars
    const nativeID = props.id || props.nativeID
    const labelledByFallback = nativeID ? `${nativeID}-label` : undefined
    const labelledByID = props['aria-labelledby'] || labelledByFallback

    // -- Handlers --

    const onPress = disabled ? () => {} : () => onCheckedChange(!checked)

    const focusedKeyHandlerProps = useFocusedPress(['Enter', ' '], () => onPress())

    // -- Render --

    return (
        <Pressable
            className={cn(
                'flex flex-row items-center',
                disabled && 'opacity-50 cursor-not-allowed',
                props.className,
            )}
            {...focusedKeyHandlerProps}
            onPress={onPress}
            hitSlop={props.hitSlop}
            role="checkbox"
            aria-labelledby={labelledByID}
            disabled={disabled}
            focusable={false}
        >
            <CheckboxRoot
                ref={ref}
                id={nativeID}
                {...props}
                aria-labelledby={labelledByID}
                className={cn(
                    'h-4 w-4 shrink-0 rounded-sm border border-primary',
                    'native:h-[20] native:w-[20] native:rounded',
                    'web:peer web:ring-offset-background',
                    'web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    disabled && 'border border-muted opacity-50 cursor-not-allowed',
                    checked && 'bg-primary',
                    checked && hasError && 'bg-danger',
                    hasError && 'border border-danger',
                    props.checkboxClassName,
                )}
                hitSlop={props.hitSlop}
                asChild
            >
                <Pressable>
                    <CheckboxIndicator
                        className={cn(
                            'items-center justify-center h-full w-full',
                            props.indicatorClassName,
                        )}
                        asChild
                    >
                        <View>
                            {checked && (
                                <Icon
                                    name="CheckFilled"
                                    size={12}
                                    color={getThemeColor('--primary-foreground')}
                                    className={cn(
                                        'text-primary-foreground',
                                        hasError && 'text-red-500',
                                    )}
                                />
                            )}
                        </View>
                    </CheckboxIndicator>
                </Pressable>
            </CheckboxRoot>
            {!!label && (
                <Text
                    className={cn(
                        'flex items-center ml-2 web:select-none',
                        'text-primary',
                        props.labelClassName,
                    )}
                    id={labelledByID}
                    disabled={disabled}
                >
                    {label}
                </Text>
            )}
        </Pressable>
    )
})

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = CheckboxProps.documentationProps<CheckboxProps>('Checkbox', {
    valueProp: 'checked',
    onChangeProp: 'onCheckedChange',
})
