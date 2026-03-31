/* --- Disclaimers ------------------------------------------------------------------------------- */

// -i- We keep this `babel-preset-expo` for Expo / universal tooling. Though Next.js *is* using SWC.
// -i- For react-native-reanimated on Next.js, see the `next.config.base.cjs`s webpack loader instead.

/* --- Babel Config ------------------------------------------------------------------------------ */

module.exports = function (api) {
    api.cache(true)
    return {
        presets: ['babel-preset-expo'],
    }
}
