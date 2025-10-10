import { Image as ExpoImage } from 'expo-image'
import { Platform } from 'react-native'
import { cssInterop } from 'nativewind'
import { parseNativewindStyles } from '../styles/parseNativewindStyles'
import { cn } from '../utils/styleUtils'
import type { UniversalImageProps, UniversalImageMethods } from './Image.types'

/* --- Styles ---------------------------------------------------------------------------------- */

const StyledExpoImage = cssInterop(ExpoImage, {
    className: 'style',
})

/* --- <Image/> -------------------------------------------------------------------------------- */

const Image = (props: UniversalImageProps): JSX.Element => {

    // Props
    const {

        /* - Universal - */
        src,
        alt,
        width,
        height,
        style,
        className,
        priority,
        onError,
        onLoadEnd,

        /* - Split - */
        expoPlaceholder,

        /* - Next.js - */
        onLoad,
        fill,

        /* - Expo - */
        accessibilityLabel,
        accessible,
        allowDownscaling,
        autoplay,
        blurRadius,
        cachePolicy,
        contentFit,
        contentPosition,
        enableLiveTextInteraction,
        focusable,
        onLoadStart,
        onProgress,
        placeholderContentFit,
        recyclingKey,
        responsivePolicy,
        
    } = props

    // -- Nativewind --

    const { nativeWindStyles, restStyle } = parseNativewindStyles(style)
    const finalStyle = { width, height, ...nativeWindStyles, ...restStyle }

    // -- Overrides --

    if (fill) finalStyle.height = '100%'
    if (fill) finalStyle.width = '100%'

    const finalClassName = cn(className, fill && 'w-full h-full')

    // -- Render --

    return (
        <StyledExpoImage
            /* - Universal - */
            source={src as any}
            alt={alt || accessibilityLabel}
            // @ts-ignore
            style={finalStyle}
            className={finalClassName}
            priority={priority}
            onError={onError}
            onLoadEnd={onLoadEnd || onLoad as any}
            /* - Split - */
            placeholder={expoPlaceholder}
            /* - Expo - */
            accessibilityLabel={alt || accessibilityLabel}
            accessible={accessible}
            blurRadius={blurRadius}
            cachePolicy={cachePolicy}
            contentFit={contentFit}
            contentPosition={contentPosition}
            focusable={focusable}
            onLoadStart={onLoadStart}
            onProgress={onProgress}
            placeholderContentFit={placeholderContentFit}
            recyclingKey={recyclingKey}
            responsivePolicy={responsivePolicy}
            /* - Platform diffs - */
            {...(Platform.select({
                web: {},
                native: {
                    autoplay,
                    enableLiveTextInteraction,
                    allowDownscaling,
                },
            }))}
        />
    )
}

/* --- Static Methods -------------------------------------------------------------------------- */

Image.clearDiskCache = ExpoImage.clearDiskCache as UniversalImageMethods['clearDiskCache']
Image.clearMemoryCache = ExpoImage.clearMemoryCache as UniversalImageMethods['clearMemoryCache']
Image.getCachePathAsync = ExpoImage.getCachePathAsync as UniversalImageMethods['getCachePathAsync']
Image.prefetch = ExpoImage.prefetch as UniversalImageMethods['prefetch']

/* --- Exports --------------------------------------------------------------------------------- */

export { Image }
