import React from 'react'

/* --- <Style/> -------------------------------------------------------------------------------- */

export const Style = (props: { children: React.ReactNode }) => {
    return (
        <style jsx global>{`
            ${props.children}
        `}</style>
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default Style
