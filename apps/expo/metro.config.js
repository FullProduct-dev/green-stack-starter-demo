// -i- Copied from https://docs.expo.dev/guides/monorepos/#modify-the-metro-config
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')
const path = require('path')

// Find the project and workspace directories
const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '../..')
const config = getDefaultConfig(projectRoot, { isCSSEnabled: true })

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot]

// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
]

// Singleton React because workspace packages (e.g. @auth/clerk → @clerk/clerk-react) can nest their own `node_modules/react`.
// A second copy could break hooks (e.g. if React Native uses the hoisted renderer + a different React version).
// By pinning the `react` + `react-dom` versions to the workspace root the entire expo app will always share 1 React instance.
const workspaceReact = path.resolve(workspaceRoot, 'node_modules/react')
const workspaceReactDom = path.resolve(workspaceRoot, 'node_modules/react-dom')
config.resolver.extraNodeModules = {
    ...config.resolver.extraNodeModules,
    react: workspaceReact,
    'react-dom': workspaceReactDom,
}

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// config.resolver.disableHierarchicalLookup = true

// 4. Use absolute path for NativeWind input so it resolves correctly (cwd can vary in monorepos)
const nativeWindInput = path.resolve(projectRoot, '../next/global.css')
const nativeWindConfigPath = path.resolve(projectRoot, 'tailwind.config.js')

// Export the modified config
module.exports = withNativeWind(config, {
    input: nativeWindInput,
    configPath: nativeWindConfigPath,
})
