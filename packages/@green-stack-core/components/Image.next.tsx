import type { JSX } from 'react'
import NextImage from 'next/image'
import { parseNativewindStyles } from '../styles/parseNativewindStyles'
import { cn } from '../utils/styleUtils'
import type { UniversalImageProps, UniversalImageMethods } from './Image.types'

/* --- <Image/> -------------------------------------------------------------------------------- */

const Image = (props: UniversalImageProps): JSX.Element => {
    // Props
    const {
        /* - Universal - */
        src,
        alt = 'Alt description missing in image',
        width,
        height,
        className,
        style = {},
        priority = 'normal',
        onError,
        onLoadEnd,
        /* - Split - */
        nextPlaceholder,
        /* - Next.js - */
        loader,
        fill: fillProp,
        sizes,
        quality,
        onLoad,
        loading,
        blurDataURL,
        unoptimized,
        /* - Expo - */
        accessibilityLabel,
        contentFit,
    } = props

    // -- Nativewind --

    const { nativeWindStyles, nativeWindClassName, restStyle } = parseNativewindStyles(style)
    const finalStyle = { width, height, ...nativeWindStyles, ...restStyle } as React.CSSProperties

    // -- Overrides --

    const fill = fillProp === true || width === '100%' || height === '100%'

    if (fill) finalStyle.height = '100%'
    if (fill) finalStyle.width = '100%'
    if (fill) finalStyle.objectFit = contentFit || 'cover'

    const finalClassName = cn(className, nativeWindClassName, fill && 'w-full h-full')

    // -- Render --

    return (
        <NextImage
            /* - Universal - */
            src={src as any}
            alt={alt || accessibilityLabel!}
            width={fill ? undefined : width as any}
            height={fill ? undefined : height as any}
            className={finalClassName}
            style={finalStyle}
            priority={priority === 'high'}
            onError={onError as any}
            onLoad={(onLoad || onLoadEnd) as any}
            /* - Split - */
            placeholder={nextPlaceholder}
            /* - Next.js - */      
            loader={loader}
            fill={fill}
            sizes={sizes}
            quality={quality}
            loading={loading}
            blurDataURL={blurDataURL}
            unoptimized={unoptimized}
        />
    )
}

/* --- Static Methods -------------------------------------------------------------------------- */

Image.clearDiskCache = (() => {}) as UniversalImageMethods['clearDiskCache']
Image.clearMemoryCache = (() => {}) as UniversalImageMethods['clearMemoryCache']
Image.getCachePathAsync = ((cacheKey: string) => {}) as UniversalImageMethods['getCachePathAsync'] // prettier-ignore
Image.prefetch = ((urls: string | string[], cachePolicy?: "memory" | "memory-disk") => {}) as UniversalImageMethods['prefetch'] // prettier-ignore

/* --- Exports --------------------------------------------------------------------------------- */

export { Image }
