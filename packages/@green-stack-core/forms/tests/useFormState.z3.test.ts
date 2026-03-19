// @ts-ignore
import { expect, test } from 'bun:test'
import { renderHook, act } from '@testing-library/react'
import { useFormState } from '../useFormState'
import { z, schema } from '../../schemas/v3'

/* --- Test Data ------------------------------------------------------------------------------- */

const User = schema('User', {
    name: z.string().default('Thorr'),
    age: z.number().default(31),
})

type User = z.infer<typeof User>

/* --- Form State Essentials ------------------------------------------------------------------- */

test('passing `initialValues` to useFormState() should apply the correct initial values', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User, {
        initialValues: { name: 'Loki', age: 29 },
    }))

    // Expect
    expect(result.current.values).toEqual({ name: 'Loki', age: 29 })
})

test('formState.values should apply the correct defaults from the zod schema if no initialValues were provided', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Expect
    expect(result.current.values).toEqual({ name: 'Thorr', age: 31 })
})

test('formState.setValues() should update the entire form state', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    act(() => {
        result.current.setValues({ name: 'Loki', age: 29 })
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Loki', age: 29 })
})

test('formState.getValue() should return the correct value for the given form field', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    act(() => {
        result.current.setValues({ name: 'Loki', age: 29 })
    })

    // Expect
    const name = result.current.getValue('name')
    expect(name).toEqual('Loki')
    const age = result.current.getValue('age')
    expect(age).toEqual(29)
})

test('formState.handleChange() should update the correct value for the given form field', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    act(() => {
        result.current.handleChange('name', 'Loki')
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Loki', age: 31 })
})

test('formState.getChangeHandler() should return the correct handler for the given form field', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    const changeName = result.current.getChangeHandler('name')
    act(() => {
        changeName('Loki')
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Loki', age: 31 })
})

test('formState.validate() should return the correct validation result', () => {
    // Hook
    const { result, rerender } = renderHook(() => useFormState(User))

    const changeName = result.current.getChangeHandler('name')

    // @ts-expect-error
    changeName(2)

    rerender()

    // Validate
    const isValid = result.current.validate()

    rerender()

    // Expect
    expect(isValid).toBe(false)
    expect(result.current.errors.age).toBeUndefined()
    expect(result.current.errors.name).toBeDefined()
    expect(result.current.errors.name).toHaveLength(1)
})

test('formState.validate() should populate errors with our custom error messages if provided', () => {
    // Custom error messages
    const errNoName = 'Please fill in a name'
    const errNoAge = 'Please provide your age'
    
    // Schema with custom error messages
    const User2 = schema('User', {
        name: z.string({ message: errNoName }).default('Thorr'),
        age: z.number({ message: errNoAge }).default(31),
    })

    // Hook
    const { result, rerender } = renderHook(() => useFormState(User2))

    const changeName = result.current.getChangeHandler('name')
    const changeAge = result.current.getChangeHandler('age')

    // @ts-expect-error
    changeName(0)

    // @ts-expect-error
    changeAge('')
    
    // Validate
    rerender()
    result.current.validate()
    rerender()

    // Expect
    expect(result.current.errors).toEqual({
        name: [errNoName],
        age: [errNoAge],
    })
})

test('passing `validateOnChange: true` to useFormState() should update validation errors on every change', () => {
    // Hook
    const { result, rerender } = renderHook(() => useFormState(User, { validateOnChange: true }))

    const changeName = result.current.getChangeHandler('name') // @ts-expect-error
    changeName(2)
    rerender()

    // Expect
    expect(result.current.errors.name).toBeDefined()
    expect(result.current.errors.name).toHaveLength(1)
})

test('formState.hasError() should return the correct error status for the given form field', () => {
    // Hook
    const { result, rerender } = renderHook(() => useFormState(User))

    // @ts-expect-error
    result.current.handleChange('name', 2)
    rerender()

    // Validate
    result.current.validate()
    rerender()

    // Expect
    expect(result.current.hasError('name')).toBe(true)
    expect(result.current.hasError('age')).toBe(false)
})

test('formState.updateErrors() should update the errors for the entire form state', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    act(() => {
        result.current.updateErrors({ name: ['Please fill in a name'] })
    })

    // Expect
    expect(result.current.errors).toEqual({ name: ['Please fill in a name'] })
})

test('formState.getErrors() should return the correct errors for the given form field', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    act(() => {
        result.current.updateErrors({ name: ['Please fill in a name'] })
    })

    // Expect
    expect(result.current.getErrors('name')).toEqual(['Please fill in a name'])
    expect(result.current.getErrors('age')).toEqual([])
})

test('formState.isValid should return the correct form validation status without needing to validate first', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // -- Unhappy path --

    const changeName = result.current.getChangeHandler('name')

    act(() => {
        // @ts-expect-error
        changeName(2)
    })

    expect(result.current.isValid).toBe(false)

    // -- Happy path --
    
    act(() => {
        changeName('Loki')
    })

    expect(result.current.isValid).toBe(true)
})

test('formState.isUnsaved should return the correct form unsaved status', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // -- Start --

    expect(result.current.isUnsaved).toBe(false)

    // -- Edits made --
    
    act(() => {
        result.current.handleChange('name', 'Loki')
    })

    expect(result.current.isUnsaved).toBe(true)

    // -- Reverted --

    act(() => {
        result.current.setValues({ name: 'Thorr', age: 31 })
    })

    expect(result.current.isUnsaved).toBe(false)
})

test('formState.clearErrors() should clear all errors until validated again', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    act(() => {
        result.current.updateErrors({ name: ['Please fill in a name'] })
    })

    // Expect
    expect(result.current.errors.name).toBeDefined()

    // Act
    act(() => {
        result.current.clearErrors()
    })

    // Expect
    expect(result.current.errors.name).toBeUndefined()
})

test('formState.clearForm() should clear the form values, applying only the schema defaults', () => {
    // Hook
    const { result } = renderHook(() => useFormState(
        User, // Has age: 31 as default
        { initialValues: { age: 29 } }, // Should be ignored when using clearForm()
    ))

    // Act
    act(() => {
        result.current.setValues((prev) => ({ ...prev, name: 'Loki' }))
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Loki', age: 29 })

    // Act
    act(() => {
        result.current.clearForm()
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Thorr', age: 31 })
})

test('formState.resetForm() should reset the form to its original state using initialValues & schema defaults', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User, {
        initialValues: { name: 'Loki', age: 29 },
    }))

    // Act
    act(() => {
        result.current.setValues({ name: 'Hulk', age: 34 })
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Hulk', age: 34 })

    // Act
    act(() => {
        result.current.resetForm()
    })

    // Expect
    expect(result.current.values).toEqual({ name: 'Loki', age: 29 })
})

test('formState.getInputProps() should return value, error state and handlers for the given form field', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    const nameInputProps = result.current.getInputProps('name')

    // Act
    act(() => {
        nameInputProps.onChange('Loki')
    })

    // Expect
    expect(result.current.values.name).toEqual('Loki')
    expect(result.current.getInputProps('name')).toEqual({
        value: 'Loki',
        onChange: expect.any(Function),
        onBlur: expect.any(Function),
        onFocus: expect.any(Function),
        hasError: false,
    })
})

test('formState.getTextInputProps() should return text value, error state and handlers for the given text input field', () => {
    // Hook
    const { result } = renderHook(() => useFormState(User))

    // Act
    const nameInputProps = result.current.getTextInputProps('name')

    // Act
    act(() => {
        nameInputProps.onChangeText('Loki')
    })

    // Expect
    expect(result.current.values.name).toEqual('Loki')
    expect(result.current.getTextInputProps('name')).toEqual({
        value: 'Loki',
        onChangeText: expect.any(Function),
        onBlur: expect.any(Function),
        onFocus: expect.any(Function),
        hasError: false,
    })
})
