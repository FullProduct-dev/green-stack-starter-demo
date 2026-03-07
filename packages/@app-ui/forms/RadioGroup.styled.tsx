"use client"
import type { ReactNode, ElementRef, Dispatch, SetStateAction } from 'react'
import { createContext, useContext, useState, useEffect, forwardRef } from 'react'
import { RadioGroupRoot, RadioGroupItem, RadioGroupIndicator } from '@green-stack/forms/RadioGroup.primitives'
import { cn, View, Text, Pressable } from '../styled'
import { z, schema, PropsOf } from '@green-stack/schemas'
import { useFocusedPress } from '@green-stack/hooks/useFocusedPress'

/* --- Context --------------------------------------------------------------------------------- */

export type RadioGroupContext = {
    value: string,
    setValue: Dispatch<SetStateAction<string>>,
}

export const RadioGroupContext = createContext<RadioGroupContext | undefined>(undefined)

export const useRadioGroupContext = () => {
    const context = useContext(RadioGroupContext)
    if (!context) throw new Error('useRadioGroupContext() must be used within a RadioGroupProvider')
    return context
}

/* --- RadioButton Props ----------------------------------------------------------------------- */

export const RadioButtonProps = schema('RadioButtonProps', {
    value: z.string(),
    label: z.string(),
    disabled: z.boolean().default(false),
    hasError: z.boolean().default(false),
    className: z.string().default('mb-4'),
    radioButtonClassName: z.string().optional(),
    indicatorClassName: z.string().optional(),
    labelClassName: z.string().optional(),
    hitSlop: z.number().default(6),
})

export type RadioButtonProps = Omit<
    PropsOf<typeof RadioGroupItem, typeof RadioButtonProps>,
    'aria-labelledby'
> & {
    ['aria-labelledby']?: string,
}

/* --- <RadioButton/> -------------------------------------------------------------------------- */

export const RadioButton = forwardRef<
    ElementRef<typeof RadioGroupItem>,
    RadioButtonProps
>((rawProps, ref) => {
    // Props
    const props = RadioButtonProps.applyDefaults(rawProps)
    const { value, label, disabled, hasError } = props

    // Vars
    const nativeID = props.id || props.nativeID || `radio-option-${value}`
    const labelledByID = `${nativeID}-label`

    // Context
    const { value: contextValue, setValue } = useRadioGroupContext()
    const checked = contextValue === value

    // -- Handlers --

    const onPress = disabled ? () => {} : () => setValue(value)

    const focusedKeyHandlerProps = useFocusedPress(['Enter', ' '], () => onPress())
    
    // -- Render --

    return (
        <Pressable
            className={cn(
                'flex flex-row items-center',
                disabled && 'cursor-not-allowed',
                props.className,
            )}
            {...focusedKeyHandlerProps}
            onPress={onPress}
            hitSlop={props.hitSlop}
        >
            <RadioGroupItem
                ref={ref}
                id={nativeID}
                aria-labelledby={labelledByID}
                onPress={onPress}
                {...props}
                disabled={disabled}
                hitSlop={props.hitSlop}
                className={cn(
                    'aspect-square h-4 w-4 rounded-full justify-centeritems-center border border-primary text-primary ',
                    'native:h-[20] native:w-[20]',
                    'web:ring-offset-background web:focus:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2',
                    disabled && 'web:cursor-not-allowed opacity-50',
                    hasError && 'border border-danger',
                    props.radioButtonClassName,
                )}
                asChild
            >
                <Pressable disabled={disabled}>
                    {checked && (
                        <RadioGroupIndicator
                            className={cn(
                                'flex flex-col items-center justify-center w-full h-full',
                                props.indicatorClassName,
                            )}
                            asChild
                        >
                            <Pressable>
                                <View
                                    className={cn(
                                        'relative aspect-square h-[9px] w-[9px] bg-primary rounded-full',
                                        'native:h-[10] native:w-[10]',
                                        hasError && 'bg-danger',
                                    )}
                                />
                            </Pressable>
                        </RadioGroupIndicator>
                    )}
                </Pressable>
            </RadioGroupItem>
            {!!label && (
                <Text
                    id={labelledByID}
                    className={cn(
                        'flex items-center ml-2 web:select-none',
                        'text-primary',
                        disabled && 'opacity-50 cursor-not-allowed',
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

RadioButton.displayName = 'RadioButton'

/* --- RadioGroup Props ------------------------------------------------------------------------ */

export const RadioGroupProps = RadioButtonProps
    .omit({ label: true })
    .extendSchema('RadioGroupProps', {
        options: z.record(z.string()),
        value: z.string().default(''),
        className: z.string().optional(), 
        radioButtonClassName: z.string().optional(),
    })

export type RadioGroupProps<T extends string | undefined = string | undefined> = Omit<
    PropsOf<typeof RadioGroupRoot, typeof RadioGroupProps>,
    'onValueChange'
> & {
    value?: T,
    children?: ReactNode,
    onChange: (value: NonNullableRequired<T>) => void,
}

/** --- createRadioGroup() --------------------------------------------------------------------- */
/** -i- Create a Universal Radio Group where you can pass a Generic type to narrow the string `value` & `onChange()` params */
const createRadioGroup = <T extends string | undefined = string | undefined>() => Object.assign(forwardRef<
    ElementRef<typeof RadioGroupRoot>,
    RadioGroupProps<T>
>((rawProps, ref) => {
    // Props
    const props = RadioGroupProps.applyDefaults(rawProps)
    const { className, options, children, onChange, ...restProps } = props

    // State
    const [value, setValue] = useState<string>(props.value)

    // -- Effects --

    useEffect(() => {
        if (value) onChange(value as NonNullableRequired<T>)
    }, [value])

    // -- Render --

    return (
        <RadioGroupContext.Provider value={{ value, setValue }}>
            <RadioGroupRoot
                ref={ref}
                {...restProps}
                value={value}
                onValueChange={setValue}
                className={cn('flex flex-col', className)}
                asChild
            >
                <Pressable>
                    {Object.entries(options).map(([optionValue, label]) => (
                        <RadioButton
                            key={optionValue}
                            {...restProps}
                            className={props.radioButtonClassName}
                            value={optionValue}
                            label={label}
                        />
                    ))}
                    {children}
                </Pressable>
            </RadioGroupRoot>
        </RadioGroupContext.Provider>
    )
}), {
    displayName: 'RadioGroup',
    Item: RadioButton,
    Option: RadioButton,
    /** -i- Create a Universal Radio Group where you can pass a Generic type to narrow the string `value` & `onChange()` params */
    create: createRadioGroup,
})

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = RadioGroupProps.documentationProps('RadioGroup', {
    exampleProps: {
        options: {
            'full-product-dev': 'Full-Product Universal App Dev',
            'front-end-dev': 'Front-End Web Developer',
            'back-end-dev': 'Back-End Web Developer',
            'mobile-app-dev': 'Mobile App Developer',
        },
        value: 'full-product-dev',
    },
})

/* --- Exports --------------------------------------------------------------------------------- */

export const RadioGroup = createRadioGroup()
