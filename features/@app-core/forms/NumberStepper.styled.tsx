import { forwardRef, ElementRef, useState, useEffect } from 'react'
import type { NativeSyntheticEvent, TextInputKeyPressEventData } from 'react-native'
import { TextInput } from './TextInput.styled'
import { z, schema } from '@green-stack/schemas'
import { cn, View, Pressable, getThemeColor } from '../components/styled'
import { Icon } from '@green-stack/components/Icon'
import { useFocusedPress } from '@green-stack/hooks/useFocusedPress'
import { isValidNumber } from '@green-stack/utils/numberUtils'

/* --- Schema ---------------------------------------------------------------------------------- */

export const NumberStepperProps = schema('NumberStepperProps', {
    value: z.number().default(0),
    min: z.number().default(0),
    max: z.number().optional(),
    step: z.number().default(1),
    placeholder: z.string().optional().example('Enter number...'),
    disabled: z.boolean().default(false),
    readOnly: z.boolean().default(false),
    startFromPlaceholder: z.boolean().default(false).describe('If true, the stepper will start from the placeholder value when pressing the +/- controls when the input is empty'),
    hasError: z.boolean().default(false),
    className: z.string().optional(),
    pressableClassName: z.string().optional(),
    textInputClassName: z.string().optional(),
    placeholderClassName: z.string().optional(),
    placeholderTextColor: z.string().optional(),
})

export type NumberStepperProps = z.input<typeof NumberStepperProps> & {
    onChange: (value: number) => void
}

/* --- useNumberStepper() ---------------------------------------------------------------------- */

export const useNumberStepper = (rawProps: NumberStepperProps) => {

    // Props
    const props = NumberStepperProps.applyDefaults(rawProps)
    const { min, max, step, disabled, hasError, onChange, ...restProps } = props

    // State
    const [value, setValue] = useState(props.value)

    // Helpers
    const constrainValue = (value: number) => Math.min(Math.max(value, min), max || Infinity)

    // Vars
    const startFromPlaceholder = props.startFromPlaceholder && isValidNumber(props.placeholder)
    const placeholderValue = startFromPlaceholder ? +rawProps.placeholder! : value
    const editableValue = value || placeholderValue
    const numberValue = constrainValue(editableValue)

    // Flags
    const hasMinValue = typeof rawProps.min !== undefined
    const hasMaxValue = typeof rawProps.max !== undefined
    const hasReachedMin = hasMinValue && numberValue === min
    const hasReachedMax = hasMaxValue && numberValue === max
    const isDecrementDisabled = disabled || hasReachedMin
    const isIncrementDisabled = disabled || hasReachedMax
 
    // -- Handlers --

    const onIncrement = () => setValue(constrainValue(editableValue + step))

    const onDecrement = () => setValue(constrainValue(editableValue - step))

    const onKeyPress = ({ nativeEvent }: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
        if (nativeEvent.key === 'ArrowUp') return onIncrement()
        if (nativeEvent.key === 'ArrowDown') return onDecrement()
    }

    const stepperButtonKeyhandlerProps = useFocusedPress(['ArrowUp', 'ArrowDown'], (key) => {
        onKeyPress({ nativeEvent: { key } } as NativeSyntheticEvent<TextInputKeyPressEventData>)
    })

    const onChangeText = (newValue = '') => {
        if (disabled) return
        // Strip non-numeric characters
        const strippedValue = newValue.replace(/[^0-9]/g, '')
        // If empty, show placeholder
        if (!strippedValue) setValue(undefined as unknown as number)
        // Convert to number
        const newNumberValue = +strippedValue 
        // @ts-ignore
        setValue(newNumberValue)
    }

    // -- Effects --

    useEffect(() => {
        if (value) onChange(value)
    }, [value])

    useEffect(() => {
        if (props.value !== value) setValue(props.value)
    }, [props.value])

    // -- Resources --

    return {
        ...restProps,
        rawProps,
        restProps,
        numberValue,
        value,
        setValue,
        min,
        max,
        step,
        disabled,
        hasError,
        isDecrementDisabled,
        isIncrementDisabled,
        constrainValue,
        onIncrement,
        onDecrement,
        onKeyPress,
        stepperButtonKeyhandlerProps,
        onChangeText,
    }
}

/* --- <NumberStepper/> ------------------------------------------------------------------------ */

export const NumberStepper = forwardRef<
    ElementRef<typeof TextInput>,
    NumberStepperProps
>((rawProps, ref) => {

    // Hooks
    const stepper = useNumberStepper(rawProps)

    // -- Render --

    return (
        <View
            className={cn(
                'h-10 native:h-12',
                'web:flex web:w-full',
                'web:max-w-[200px]',
                stepper.className,
            )}
        >
            <Pressable
                className={cn(
                    "absolute top-0 left-0 items-center justify-center select-none z-10",
                    "w-10 h-10 native:w-12 native:h-12",
                    "border-r border-r-input",
                    stepper.isDecrementDisabled && 'opacity-50 web:cursor-not-allowed',
                    stepper.hasError && 'border-r-danger',
                    stepper.pressableClassName,
                )}
                {...stepper.stepperButtonKeyhandlerProps}
                onPress={stepper.onDecrement}
                disabled={stepper.isDecrementDisabled}
                hitSlop={10}
            >
                <Icon name="RemoveFilled" size={20} color={getThemeColor('--primary')} />
            </Pressable>
            <TextInput
                ref={ref}
                inputMode="numeric"
                {...stepper.restProps}
                className={cn(
                    'text-center',
                    'px-10 native:px-12',
                    'web:max-w-[200px]',
                    'native:min-w-[130]',
                    stepper.disabled && 'cursor-not-allowed text-muted border-muted',
                    stepper.textInputClassName,
                )}
                onKeyPress={stepper.onKeyPress}
                disabled={stepper.disabled}
                hasError={stepper.hasError}
                value={stepper.value ? `${stepper.value}` : ''}
                onChangeText={stepper.onChangeText}
            />
            <Pressable
                className={cn(
                    "absolute top-0 right-0 items-center justify-center select-none z-10",
                    "w-10 h-10 native:w-12 native:h-12",
                    "border-l border-l-input",
                    stepper.isIncrementDisabled && 'opacity-50 web:cursor-not-allowed',
                    stepper.hasError && 'border-l-danger',
                    stepper.pressableClassName,
                )}
                {...stepper.stepperButtonKeyhandlerProps}
                onPress={stepper.onIncrement}
                disabled={stepper.isIncrementDisabled}
                hitSlop={10}
            >
                <Icon name="AddFilled" size={20} color={getThemeColor('--primary')} />
            </Pressable>
        </View>
    )
})

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = NumberStepperProps.documentationProps('NumberStepper')
