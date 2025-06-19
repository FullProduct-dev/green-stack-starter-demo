import fs from 'fs'
import { excludeDirs, excludeModules, parseWorkspaces, globRel } from './helpers/scriptUtils'
import { isEmpty } from '../utils/commonUtils'

/* --- Goal ------------------------------------------------------------------------------------ */

// -i- This script is used to check the workspaces in the monorepo for any missing dependencies or env vars

/* --- Constants ------------------------------------------------------------------------------- */

const KNOWN_ENV_VARS = ['NODE_ENV', 'TZ', 'PORT', 'MAX_TRIES', 'FIX_MODE', 'ENDPOINT', 'HEALTH_ENDPOINT', 'GRAPHQL_ENDPOINT', 'TIME_INCREMENT'] // prettier-ignore
const NODE_INTERNALS = ['fs', 'path', 'glob', 'uuid', 'util', 'os', 'events', 'child_process', 'http', 'https', 'crypto', 'stream', 'zlib', 'assert', 'tty', 'net', 'url', 'querystring', 'dns', 'dgram', 'tls']
const SKIPPED_WORKSPACES = ['@green-stack/core', '@app/registries']
const SKIPPED_PACKAGES = [...NODE_INTERNALS, 'react', 'react-native', 'next', 'expo', 'expo-router', 'zod', 'dot-prop', 'expo-image', 'react-native-svg', 'graphql', 'expo-constants', 'nativewind', 'graphql-type-json', 'graphql-tag', 'crypto-js', 'gql.tada', '@tanstack/react-query', '@as-integrations/next', '@graphql-tools/merge', '@graphql-tools/schema', '@apollo/server', 'module-alias', '@turbo/gen', '@graphql-tools/load-files']

const mainEnvFilePath = '../../apps/next/.env'
const localEnvFilePath = '../../apps/next/.env.local'

/** --- createExportsFile() -------------------------------------------------------------------- */
/** -i- Creates an exports file */
const createExportsFile = (ctx: {
    exports: string,
}) => [
    `// -i- Auto generated with "npx turbo run @green-stack/core#check:workspaces"`,
    `module.exports = ${ctx.exports}\n`,
].join('\n')

/* --- check-workspaces ------------------------------------------------------------------------ */

const checkWorkspaces = async (isDeepCheck = true) => {
    try {
        // Load .env file in dev mode
        const isDev = process.env.NODE_ENV !== 'production'
        const hasMainEnv = fs.existsSync(mainEnvFilePath)
        const hasLocalEnv = fs.existsSync(localEnvFilePath)
        const [envFilePath] = [hasMainEnv && mainEnvFilePath, hasLocalEnv && localEnvFilePath].filter(Boolean) as string[] // prettier-ignore

        const { config: dotenvConfig } = await import('dotenv')
        if (isDev && envFilePath) dotenvConfig({ path: envFilePath })

        // Load main tsconfig.json
        const appCoreTsConfig = JSON.parse(fs.readFileSync('../../features/@app-core/tsconfig.json', 'utf8')) // prettier-ignore
        const typescriptAliases = Object.keys(appCoreTsConfig.compilerOptions.paths).map((path: string) => path.split('/*')[0])

        // Scan all /features/  and /packages/ workspace .ts & .tsx files
        const featureFiles = globRel('../../features/**/*.ts*').filter(excludeDirs)
        const packageFiles = globRel('../../packages/**/*.ts*').filter(excludeDirs)
        const allWsFiles = [...featureFiles, ...packageFiles].filter(excludeModules)

        // Figure out import paths from each workspace
        const { workspaceConfigs, workspaceImports, workspacePaths, workspacePackages } = parseWorkspaces() // prettier-ignore

        // Figure out package versions
        const expoPackageConfig = JSON.parse(fs.readFileSync('../../apps/expo/package.json', 'utf8'))
        const nextPackageConfig = JSON.parse(fs.readFileSync('../../apps/next/package.json', 'utf8'))
        const allPackageConfigs = [expoPackageConfig, nextPackageConfig, ...Object.values(workspaceConfigs)] // prettier-ignore
        const allPackageVersions = allPackageConfigs.reduce((acc, packageJSON) => {
            const { dependencies = [], devDependencies = [], peerDependencies = [] } = packageJSON
            const allDependencies = { ...dependencies, ...devDependencies, ...peerDependencies }
            return { ...acc, ...allDependencies }
        }, {})

        // Loop through each workspace and track its imports and env var uses
        const workspaceMap = {} as ObjectType<any$Todo>
        let workspaceResolutions = {} as Record<string, string | boolean>
        await Promise.all(workspacePaths.map(async (workspacePath) => {
            const workspacePackage = workspaceImports[workspacePath]

            // Double check based on file paths if a deep check is requested
            if (isDeepCheck) {
                
                // Get the related package JSON config
                const { __tabSize, ...packageJSON } = workspaceConfigs[workspacePath]
                const shouldSkip = SKIPPED_WORKSPACES.includes(workspacePackage)
                
                // Get all the lines of code from the workspace
                const workspaceFiles = allWsFiles.filter((filePath) => filePath.includes(`${workspacePath}/`))
                const fileContents = workspaceFiles.map((filePath) => fs.readFileSync(filePath, 'utf8'))
                const allLinesOfCode = fileContents.map((content) => content.split('\n')).flat()
                
                // Rebuild the related workspaces list
                const filterByRelevancy = (line: string) => line.includes(` from '`) && !line.includes(`./`)
                const allImportLines = allLinesOfCode.filter(filterByRelevancy)
                const allImportPaths = allImportLines.map((line) => line.split(` from '`)[1].split(`'`)[0])
                const containsWorkspaces = (wsPkg: string) => allImportPaths.some((path) => path.includes(`${wsPkg}/`))
                const newRelatedWorkspaces = workspacePackages.filter(containsWorkspaces)

                // List all the packages being used in that workspace
                const workspaceDeps = allImportPaths.reduce((acc, importPath) => {
                    const [firstPart, secondPart] = importPath.split('/')
                    const isScoped = firstPart.startsWith('@')
                    const packageName = isScoped ? `${firstPart}/${secondPart}` : firstPart
                    const packageVersion = allPackageVersions[packageName]
                    if (!packageVersion) return acc
                    if (packageName.includes('${')) return acc
                    if (packageName.includes(')')) return acc
                    if (packageName.includes(':')) return acc
                    if (SKIPPED_PACKAGES.includes(packageName)) return acc
                    if (workspacePackages.includes(packageName)) return acc
                    if (typescriptAliases.includes(packageName)) return acc
                    return { ...acc, [packageName]: packageVersion }
                }, {} as Record<string, string>)
                
                // Rebuild the required env vars list
                const allProcessEnvLines = allLinesOfCode.filter((line) => line.includes('process.env.'))
                const allProcessEnvVars = allProcessEnvLines.map((line) => line.match(/process\.env\.([A-Z0-9_]+)/)?.[1]) // prettier-ignore
                const filterEnvs = (envVar?: string) => {
                    if (shouldSkip) return false // Don't check @green-stack packages
                    return !KNOWN_ENV_VARS.includes(envVar!)
                }
                const newRequiredEnvVars = allProcessEnvVars.filter(filterEnvs)
                
                // Rebuild the "stackConfig" metadata for the package.json
                const existingRelations = packageJSON?.stackConfig?.relatedWorkspaces || []
                const prevRequiredEnvVars = packageJSON?.stackConfig?.requiredEnvVars || []
                const relatedWorkspaces = Array.from(new Set([...existingRelations, ...newRelatedWorkspaces])) // prettier-ignore
                const requiredEnvVars = Array.from(new Set([...prevRequiredEnvVars, ...newRequiredEnvVars])) // prettier-ignore
                workspaceMap[workspacePath] = {
                    ...packageJSON.stackConfig,
                    relatedWorkspaces,
                    requiredEnvVars,
                }

                // Figure out if packages are missing from the package.json
                const packageDeps = Object.keys({
                    ...packageJSON.dependencies,
                    ...packageJSON.devDependencies,
                    ...packageJSON.peerDependencies,
                })
                const missingDeps = Object.keys(workspaceDeps).filter((dep) => !packageDeps.includes(dep))
                const hasMissingDeps = missingDeps.length > 0

                // Save the updated package.json?
                const hasChangedRelations = existingRelations.join('-') !== relatedWorkspaces.join('-')
                const hasChangedEnvVars = prevRequiredEnvVars.join('-') !== requiredEnvVars.join('-')
                const hasChanged = !shouldSkip && isDev && (hasChangedRelations || hasChangedEnvVars)
                const shouldChange = isDeepCheck && (hasChanged || hasMissingDeps)
                if (shouldChange) {
                    if (!packageJSON.stackConfig) packageJSON.stackConfig = { relatedWorkspaces, requiredEnvVars } // prettier-ignore
                    packageJSON.dependencies = { ...packageJSON.dependencies, ...workspaceDeps }
                    packageJSON.stackConfig.relatedWorkspaces = relatedWorkspaces
                    packageJSON.stackConfig.requiredEnvVars = requiredEnvVars
                    fs.writeFileSync(`../../${workspacePath}/package.json`, `${JSON.stringify(packageJSON, null, __tabSize)}`)
                }
            }

            // Do a shallow check of the workspace's package.json
            if (!isDeepCheck) {
                const packageJSON = workspaceConfigs[workspacePath]
                const relatedWorkspaces = packageJSON?.stackConfig?.relatedWorkspaces || []
                const requiredEnvVars = packageJSON?.stackConfig?.requiredEnvVars || []
                workspaceMap[workspacePath] = {
                    ...packageJSON.stackConfig,
                    workspacePackage,
                    relatedWorkspaces,
                    requiredEnvVars,
                }
            }

            // Check for missing env vars
            const { requiredEnvVars } = workspaceMap[workspacePath] || {}
            const getEnvVar = (rawEnvVar: string) => {
                const envVar = rawEnvVar.replace('EXPO_PUBLIC_', '').replace('NEXT_PUBLIC_', '')
                return process.env[envVar] || process.env[`NEXT_PUBLIC_${envVar}`] || process.env[`EXPO_PUBLIC_${envVar}`]
            }
            const missingEnvVars = requiredEnvVars.filter((envVar: string) => isEmpty(getEnvVar(envVar)))

            // Check for missing related workspaces
            const { relatedWorkspaces } = workspaceMap[workspacePath]
            const workspaceIdentifiers = [...workspacePaths, ...workspacePackages]
            const missingWorkspaces = relatedWorkspaces.filter((ws: string) => !workspaceIdentifiers.includes(ws))

            // Check for resolutions to add to next.config.js
            const stackConfig = workspaceMap[workspacePath]
            workspaceResolutions = { ...workspaceResolutions, ...stackConfig?.resolutions }

            // Warn of any missing env vars or related workspaces
            if (missingEnvVars.length || missingWorkspaces.length) console.warn(`\n-!- --- /${workspacePath}/ ${'-'.repeat(45 - workspacePath.length - 2)} -!-`) // prettier-ignore
            if (missingEnvVars.length) {
                console.warn(`-!- ⚠️ Missing env vars for '/${workspacePath}/':`, missingEnvVars.join(', '))
                console.warn(`-i- Please add these through a secret manager (like doppler.com) or another env var config like .env`) // prettier-ignore
                console.warn(`-i- You may need to prefix them with NEXT_PUBLIC_ or EXPO_PUBLIC_ depending on the target`) // prettier-ignore
                if (isDev && !envFilePath) console.warn(`-!- Couldn't detect a .env file in /apps/next/ - you may need to create one, see .example.env`) // prettier-ignore
                // Log CI env var warnings?
                const missingExpoToken = missingEnvVars.includes('EXPO_ACCESS_TOKEN')
                const missingCItokens = missingExpoToken
                if (missingExpoToken) console.log('-i- EXPO_ACCESS_TOKEN is used for automatically deploying your app to Expo from CI, get it from expo.dev') // prettier-ignore
                if (missingCItokens) console.log(`-i- If you don't plan on using CI for these, remove them from the "stackConfig" field in this package's package.json`) // prettier-ignore
            }
            if (missingWorkspaces.length) {
                console.warn(`-!- ⚠️ Missing related workspaces for '/${workspacePath}': ${missingWorkspaces.join(', ')}`) // prettier-ignore
                console.warn(`-i- Either:   a) Merge them in from your copy of the full-product 'green-stack' starter repo`) // prettier-ignore
                console.warn(`              b) Copy the related workspace over from another project to /features/ or /packages/`) // prettier-ignore
            }
            if (missingEnvVars.length || missingWorkspaces.length) console.warn(`-!- ${'-'.repeat(50)} -!-\n`) // prettier-ignore

            // No errors? Resolve promise
            return true
        }))

        // Save transpiledWorkspaces.generated.js to /packages/registries/ workspace
        const transpiledWorkspacesPath = '../../packages/@registries/transpiledWorkspaces.generated.js'
        const transpiledWorkspaces = createExportsFile({ exports: JSON.stringify(workspacePackages, null, 4) }) // template.replace('{{exports}}', JSON.stringify(workspacePackages, null, 4)) // prettier-ignore
        fs.writeFileSync(transpiledWorkspacesPath, transpiledWorkspaces, 'utf8')

        // Save workspaceResolutions.generated.js to /packages/registries/ workspace
        const workspaceResolutionsPath = '../../packages/@registries/workspaceResolutions.generated.js'
        const workspaceResolutionsFile = createExportsFile({ exports: JSON.stringify(workspaceResolutions, null, 4) }) // template.replace('{{exports}}', JSON.stringify(workspaceResolutions, null, 4)) // prettier-ignore
        fs.writeFileSync(workspaceResolutionsPath, workspaceResolutionsFile, 'utf8')
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

checkWorkspaces(!!process.env.FIX_MODE && !!JSON.parse(process.env.FIX_MODE))
