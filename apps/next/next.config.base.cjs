/** @type {import('next').NextConfig} */
const mainNextConfig = {
    reactStrictMode: true,
    logging: false, // -i- https://nextjs.org/docs/app/api-reference/config/next-config-js/logging
    transpilePackages: [
        "react-native",
        "react-native-web",
        "react-native-svg",
        "expo",
        "expo-constants",
        "expo-modules-core",
        "@rn-primitives/hooks",
        "@rn-primitives/slot",
        "@rn-primitives/portal",
        "@rn-primitives/switch",
        "@rn-primitives/radio-group",
        "@rn-primitives/checkbox",
        "@rn-primitives/select",
        "nativewind",
        "react-native-css-interop",
        "react-native-reanimated",
        "react-native-safe-area-context",
        // Add more React Native / Expo packages here...
    ],
    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
    typescript: {
        ignoreBuildErrors: true,
    },
    experimental: {
        forceSwcTransforms: true,
    },
    images: {
        qualities: [75, 100],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "codinsonn.dev",
            }
        ]
    }
}

// Re-exported separately so it can be reused
// in other configs like in `with/automatic-docs`
module.exports = mainNextConfig;
