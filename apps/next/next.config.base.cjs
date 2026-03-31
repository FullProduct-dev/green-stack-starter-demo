const path = require('path')

/* --- Next.js Config -------------------------------------------------------------------------- */

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
        "expo-status-bar",
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
    async rewrites() {
        return [
            {
                source: '/js/sf/script.js',
                destination: 'https://datafa.st/js/script.js',
            },
            {
                source: '/api/events',
                destination: 'https://datafa.st/api/events',
            },
        ]
    },
    webpack: (config, ctx) => {
        // -i- Reanimated + react-native-worklets: the `'worklet'` directive must be transformed everywhere
        // -i- In __DEV__, Worklets runs a probe worklet in initializeRNRuntime();
        // -i- Without the plugin on the server bundle, isWorkletFunction() fails → WorkletsError on Next SSR.
        // -i- See: https://docs.swmansion.com/react-native-reanimated/docs/guides/web-support/
        const workspaceRoot = path.resolve(__dirname, '../..')
        config.module.rules.unshift({
            test: /\.[jt]sx?$/,
            include: [
                path.join(workspaceRoot, 'packages/@app-ui'),
                path.join(workspaceRoot, 'node_modules/react-native-reanimated'),
                path.join(workspaceRoot, 'node_modules/react-native-worklets'),
            ],
            use: {
                loader: 'babel-loader',
                options: {
                    cacheDirectory: true,
                    presets: [
                        ['@babel/preset-typescript', { allowDeclareFields: true, isTSX: true, allExtensions: true }],
                        ['@babel/preset-react', { runtime: 'automatic' }],
                    ],
                    plugins: ['react-native-reanimated/plugin'],
                },
            },
        })
        return config
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

/* --- Exports --------------------------------------------------------------------------------- */

// -i- Re-exported separately so it can be reused in other configs like in `with/automatic-docs`
module.exports = mainNextConfig
