import React from 'react'

/* --- <WebView/> ------------------------------------------------------------------------------ */

export const WebView = (props: React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>) => (
    <iframe {...props} />
)

/* --- Exports --------------------------------------------------------------------------------- */

export default WebView
