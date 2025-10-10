import React from 'react'
import { CoreContext } from '../context/CoreContext'
import type { UniversalImageProps, UniversalImageMethods } from './Image.types'

/* --- <Image/> --------------------------------------------------------------------------------- */

const Image = ((props: UniversalImageProps) => {

    // Context
    const { contextImage: ContextImage } = React.useContext(CoreContext)

    // Static methods
    if (!Image.clearDiskCache) Image.clearDiskCache = ContextImage.clearDiskCache
    if (!Image.clearMemoryCache) Image.clearMemoryCache = ContextImage.clearMemoryCache
    if (!Image.getCachePathAsync) Image.getCachePathAsync = ContextImage.getCachePathAsync
    if (!Image.prefetch) Image.prefetch = ContextImage.prefetch

    // Render
    return <ContextImage {...props} />

}) as ((props: UniversalImageProps) => JSX.Element) & UniversalImageMethods

/* --- Exports --------------------------------------------------------------------------------- */

export { Image }
