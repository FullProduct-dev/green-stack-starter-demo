import React from 'react'

export const WebView = (props: React.DetailedHTMLProps<React.IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>) => (
    <iframe {...props} />
)
