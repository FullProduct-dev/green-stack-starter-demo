import { cn } from '../utils/styleUtils'
import { forwardRef, type ForwardedRef, type PropsWithoutRef } from 'react'

/* --- Reexports ------------------------------------------------------------------------------- */

export * from '../utils/styleUtils'

/* --- Utility --------------------------------------------------------------------------------- */

export const styled = <
    COMP extends React.ElementType,
    REF extends React.ComponentRef<COMP>,
    PROPS extends React.ComponentProps<COMP>,
>(Component: COMP, className = '', defaultProps?: Partial<PROPS>) => {
    // @ts-ignore
    const fallbackName = [Component.displayName, Component.name].filter(Boolean).join('.')
    const displayName = typeof Component === 'string' ? Component : fallbackName
    type StyledProps = PROPS & { className?: string }
    const StyledComponent = forwardRef<REF, StyledProps>(
        (props: PropsWithoutRef<StyledProps>, ref: ForwardedRef<REF>) => {
            const finalClassName = cn(className, props.className)
            return (
                // @ts-ignore
                <Component
                    ref={ref}
                    {...defaultProps}
                    {...props}
                    className={finalClassName}
                />
            )
        }
    )
    StyledComponent.displayName = displayName
    return StyledComponent
}
