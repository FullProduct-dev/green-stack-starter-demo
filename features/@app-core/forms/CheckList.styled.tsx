import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { z } from '@green-stack/schemas'
import { Checkbox, CheckboxProps } from './Checkbox.styled'
import { arrFromSet } from '@green-stack/utils/arrayUtils'

/* --- Context --------------------------------------------------------------------------------- */

export type CheckListContext = {
    values: string[],
    toggleValue: (value: string) => void,
}

export const CheckListContext = createContext<CheckListContext | undefined>(undefined)

export const useCheckListContext = () => {
    const context = useContext(CheckListContext)
    if (!context) throw new Error('useCheckListContext() must be used within a CheckListProvider')
    return context
}

/* --- CheckListOption Props ------------------------------------------------------------------- */

export const CheckListOptionProps = CheckboxProps
    .omit({ checked: true })
    .extendSchema('CheckListOptionProps', {
        className: z.string().default('mb-4'),
        value: z.string(),
    })

export type CheckListOptionProps = z.input<typeof CheckListOptionProps>

/* --- <CheckList.Option/> --------------------------------------------------------------------- */

export const CheckListOption = (props: CheckListOptionProps) => {

    // Props
    const { value, label, ...restProps } = CheckListOptionProps.applyDefaults(props)
    const { className, checkboxClassName, indicatorClassName } = restProps

    // Vars
    const nativeID = `checklist-option-${value}`

    // Context
    const { values: contextValues, toggleValue } = useCheckListContext()
    const checked = contextValues.includes(value)

    // -- Render --

    return (
        <Checkbox
            checked={checked}
            onCheckedChange={() => toggleValue(value)}
            label={label || value}
            id={nativeID}
            {...restProps}
            className={className}
            checkboxClassName={checkboxClassName}
            indicatorClassName={indicatorClassName}
        />
    )
}

/* --- CheckList Props ------------------------------------------------------------------------- */

export const CheckListProps = CheckboxProps
    .omit({ checked: true, label: true })
    .extendSchema('CheckListProps', {
        options: z.record(z.string()),
        value: z.array(z.string()).default([]),
    })

export type CheckListProps<T extends string[] = string[]> = z.input<typeof CheckListProps> & {
    value: T,
    children?: ReactNode,
    onChange: (value: T) => void,
}

/* --- <CheckList/> ---------------------------------------------------------------------------- */

const CheckListComponent = <T extends string[] = string[]>(rawProps: CheckListProps<T>) => {
    
    // Props
    const props = CheckListProps.applyDefaults(rawProps)
    const { value: currentItems, options, children, onChange, ...restProps } = props

    // State
    const [values, setValues] = useState<T>(currentItems)

    // Vars
    const valuesKey = values?.filter?.(Boolean).join('-')
    const propValuesKey = currentItems?.filter?.(Boolean).join('-')

    // -- Handlers --

    const toggleValue = (value: string) => {
        if (props.disabled) return
        const shouldAdd = !currentItems.includes(value) // @ts-ignore
        setValues(shouldAdd ? [...currentItems, value] : values.filter((v) => v !== value))
    }

    // -- Effects --

    useEffect(() => {
        onChange(arrFromSet(values || []) as T)
    }, [valuesKey])

    useEffect(() => {
        if (valuesKey !== propValuesKey) setValues(currentItems)
    }, [propValuesKey])

    // -- Render --

    return (
        <CheckListContext.Provider value={{ values, toggleValue }}>
            {Object.entries(options).map(([value, label]) => (
                <CheckListOption
                    key={value}
                    value={value}
                    label={label}
                    {...restProps}
                />
            ))}
            {children}
        </CheckListContext.Provider>
    )
}

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = CheckListProps.documentationProps('CheckList', {
    exampleProps: {
        value: ['web'],
        options: {
            'web': 'Web - Organic traffic on Google',
            'ios': 'iOS - Mobile App in App Store',
            'android': 'Android - Mobile App in Play Store',
        }
    }
})

/* --- Exports --------------------------------------------------------------------------------- */

export const CheckList = Object.assign(CheckListComponent, {
    Item: CheckListOption,
    Option: CheckListOption,
})
