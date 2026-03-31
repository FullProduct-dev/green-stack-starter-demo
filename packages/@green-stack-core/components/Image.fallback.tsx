import React from 'react'
import type { JSX } from 'react'
import type { UniversalImageProps, UniversalImageMethods } from './Image.types'

/* --- Notes ----------------------------------------------------------------------------------- */

// -i- Fallback Image for contexts without CoreContext.Provider (e.g. "use dom" components
// -i- which run in an isolated WebView with no access to the host app's React context).
// -i- Renders native <img> - works in DOM/WebView environments.

/* --- Helpers --------------------------------------------------------------------------------- */

const resolveImgSrc = (src: UniversalImageProps['src']): string => {
    if (typeof src === 'string') return src
    if (typeof src === 'object' && src && 'uri' in src) return (src as { uri: string }).uri
    if (typeof src === 'number') return String(src) // Metro asset ID - bundler resolves at runtime
    return ''
}

/* --- <Image/> -------------------------------------------------------------------------------- */

const Image = (props: UniversalImageProps): JSX.Element => {
    const { src, alt = '', className, fill, style, width, height, ...rest } = props
    return React.createElement('img', {
        src: resolveImgSrc(src),
        alt,
        className,
        loading: (rest as any).loading,
        style: fill ? { width: '100%', height: '100%', objectFit: 'cover' } : { width, height, ...(style as object) },
        ...rest,
    })
}

/* --- Static Methods (no-op in fallback) ------------------------------------------------------ */

Image.clearDiskCache = async () => {}
Image.clearMemoryCache = async () => {}
Image.getCachePathAsync = async () => ''
Image.prefetch = async () => {}

/* --- Exports --------------------------------------------------------------------------------- */

export { Image }
export type { UniversalImageProps, UniversalImageMethods }
