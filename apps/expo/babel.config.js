const { hasModule } = require('babel-preset-expo/build/common')
const { expoRouterBabelPlugin } = require('babel-preset-expo/build/expo-router-plugin')

/* --- Disclaimers ----------------------------------------------------------------------------) */

// -i- babel-preset-expo only adds expo-router's Babel plugin when `hasModule('expo-router')` is true;
// -i- that uses `require.resolve` from babel-preset-expo's package root.
// -i- If expo-router is nested (e.g. only under apps/expo/node_modules in a monorepo),
// -i- the preset skips the plugin and Metro fails on expo-router/_ctx.*.js

const explicitExpoRouterPlugin = hasModule('expo-router') ? [] : [expoRouterBabelPlugin]

/* --- Babel Config ----------------------------------------------------------------------------*/

module.exports = function (api) {
    api.cache(true)
    return {
        presets: [
            // -i- babel-preset-expo manages the Reanimated Babel plugin for Reanimated v4 (Expo SDK 54+)
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
        // -i- Reanimated 3.17 uses react-native-reanimated/plugin (worklets/plugin is for Reanimated 4.x)
        // -i- react-native-reanimated/plugin MUST be last - required for valueUnpacker worklet transform
        plugins: [...explicitExpoRouterPlugin, 'react-native-reanimated/plugin'],
    }
}
