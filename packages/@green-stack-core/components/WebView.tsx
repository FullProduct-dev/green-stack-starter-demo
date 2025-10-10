import { WebView as NativeWebView } from 'react-native-webview'
import { styled } from '../styles'

/* --- Styles ---------------------------------------------------------------------------------- */

const StyledWebView = styled(NativeWebView)

/* --- Props ----------------------------------------------------------------------------------- */

type WebViewProps = React.ComponentProps<typeof NativeWebView> & {
    className?: string
    src?: string
}

/* --- <WebView/> ------------------------------------------------------------------------------ */

export const WebView = (props: WebViewProps) => {
    return (
        <StyledWebView
            {...props}
            source={props.src ? { uri: props.src } : undefined}
        />
    )
}

/* --- Exports --------------------------------------------------------------------------------- */

export default WebView
