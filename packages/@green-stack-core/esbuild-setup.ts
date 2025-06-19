import 'esbuild-register/dist/node' // @ts-ignore
import { addAliases } from 'module-alias'

/* --- Reanimated Fixes ------------------------------------------------------------------------ */

// @ts-ignore
global.__DEV__ = true // @ts-ignore
globalThis.__DEV__ = true // -i- Set dev mode for react-native-reanimated

/* --- Aliases --------------------------------------------------------------------------------- */

addAliases({
    // -i- We need aliases for these as they touch parts of react-native that ship Flow types
    // -i- ...which our typescript + node esbuild scripts & generators can't deal with.
    'expo-constants': './__mocks__/expo-constants.mock.ts',
    'react-native': 'react-native-web',
    // -i- Animation Mocks
    'react-native-reanimated': 'react-native-reanimated/mock',
    // -i- Navigation Mocks
    '@green-stack/navigation/Link.types': '@green-stack/navigation/mock',
    '@green-stack/navigation/Link.web': '@green-stack/navigation/mock',
    '@green-stack/navigation/Link': '@green-stack/navigation/mock',
    '@green-stack/navigation/UseRouter.types': '@green-stack/navigation/mock',
    '@green-stack/navigation/UseRouteParams.types': '@green-stack/navigation/mock',
    '@green-stack/navigation': '@green-stack/navigation/mock',
    // -i- Icons and SVG Mocks
    'react-native-svg': '@green-stack/core/svg/svg.mock',
    '@green-stack/svg': '@green-stack/core/svg/svg.mock',
    '@green-stack/core/svg/svg.primitives': '@green-stack/core/svg/svg.mock',
    '@green-stack/core/components/Icon': '@green-stack/core/components/Icon.mock',
    '@green-stack/components/Icon': '@green-stack/core/components/Icon.mock',
})
