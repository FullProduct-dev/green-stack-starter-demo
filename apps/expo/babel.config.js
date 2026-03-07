module.exports = function (api) {
  api.cache(true)
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind', reanimated: false }],
      'nativewind/babel',
    ],
    // Reanimated 3.17 uses react-native-reanimated/plugin (worklets/plugin is for Reanimated 4.x)
    // Plugin MUST be last - required for valueUnpacker worklet transform
    plugins: ['react-native-reanimated/plugin'],
  }
}
