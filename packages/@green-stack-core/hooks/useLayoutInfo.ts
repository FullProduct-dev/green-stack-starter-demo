import { useState } from 'react'
import { LayoutChangeEvent, LayoutRectangle, MeasureOnSuccessCallback } from 'react-native'

/* --- Types ----------------------------------------------------------------------------------- */

type LayoutInfo = LayoutRectangle & {
    pageX?: number
    pageY?: number
}

/** --- useLayoutInfo() ------------------------------------------------------------------------ */
/** -i- Save & use layout info for components under string keys, e.g.: @example ```
 *
 *      import useLayoutInfo from '../useLayoutInfo()'
 *
 *      const { measureOnLayout, layoutInfo } = useLayoutInfo()
 *
 *      <View onLayout={measureOnLayout('MyCustomView')} />
 *
 *      const viewHeight = layoutInfo.MyCustomView?.height
 * ``` */
export const useLayoutInfo = () => {

    // State
    const [layoutInfo, setLayoutInfo] = useState<{ [componentKey: string]: LayoutInfo }>({}) // prettier-ignore

    // -- Handlers --

    const measureOnLayout =
        (componentKey: string, callback?: (measurements: LayoutInfo) => void) =>
        ({ nativeEvent }: LayoutChangeEvent) => {
            const { layout } = nativeEvent
            const { x, y, width, height } = layout
            const layoutMeasurements = {
                ...layoutInfo[componentKey], // preserve 'pageX' & 'pageY' if available
                x,
                y,
                width,
                height,
            }

            setLayoutInfo({ ...layoutInfo, [componentKey]: layoutMeasurements })
            if (callback) callback(layoutMeasurements)
        }

    const measureRef =
        (componentKey: string, callback?: (measurements: LayoutInfo) => void) =>
        (...measurements: Parameters<MeasureOnSuccessCallback>) => {
            const [x, y, width, height, pageX, pageY] = measurements
            const refMeasurements: LayoutInfo = { x, y, width, height, pageX, pageY }
            setLayoutInfo({
                ...layoutInfo,
                [componentKey]: refMeasurements,
            })
            if (callback) callback(refMeasurements)
        }

    // -- Return --

    return { layoutInfo, measureOnLayout, measureRef }
}

/* --- Export ---------------------------------------------------------------------------------- */

export default useLayoutInfo
