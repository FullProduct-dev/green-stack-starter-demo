"use client"
import { forwardRef, ElementRef } from 'react'
import { TextInput as BaseTextInput } from '@green-stack/forms/TextInput.primitives'
import { cn } from '../styled'
import { z, PropsOf } from '@green-stack/schemas'
import { TextInputProps } from './TextInput.styled'

/* --- Props ----------------------------------------------------------------------------------- */

export const TextAreaProps = TextInputProps.extendSchema('TextAreaProps', {
    multiline: z.boolean().default(true).describe('See `numberOfLines`. Also disables some `textAlign` props.'),
    numberOfLines: z.number().optional(),
    textAlign: z.enum(['left', 'center', 'right']).default('left').describe('Might not work if multiline'),
    textAlignVertical: z.enum(['top', 'center', 'bottom']).default('top').describe('Might not work if multiline'),
})

export type TextAreaProps = PropsOf<typeof BaseTextInput, typeof TextAreaProps>

/* --- <TextArea/> ----------------------------------------------------------------------------- */

export const TextArea = forwardRef<
    ElementRef<typeof BaseTextInput>,
    TextAreaProps
>((rawProps, ref) => {
    // Props
    const props = TextAreaProps.applyDefaults(rawProps)

    // -- Render --

    return (
        <BaseTextInput
            ref={ref}
            {...props}
            placeholderClassName={cn(
                'text-muted',
                props.placeholderClassName,
            )}
            className={cn(
                'min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base text-foreground',
                'web:flex web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 web:ring-offset-background',
                'native:text-lg native:leading-[1.25]',
                'lg:text-sm',
                'placeholder:text-muted',
                'test-end',
                props.textAlign === 'left' && 'text-left',
                props.textAlign === 'center' && 'text-center',
                props.textAlign === 'right' && 'text-right',
                props.textAlignVertical === 'top' && 'items-start',
                props.textAlignVertical === 'center' && 'items-center',
                props.textAlignVertical === 'bottom' && 'items-end',
                props.editable === false && 'opacity-50 web:cursor-not-allowed',
                props.disabled && 'opacity-50 web:cursor-not-allowed',
                props.hasError && 'border-danger',
                props.className,
            )}
        />
    )
})

/* --- Docs ------------------------------------------------------------------------------------ */

export const getDocumentationProps = TextAreaProps.documentationProps('TextArea', {
    onChangeProp: 'onChangeText',
})
