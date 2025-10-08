import { globSync } from 'glob'
import fs from 'fs'
import type { ALLOWED_METHODS, DataBridgeType } from '../../schemas/createDataBridge'
import type { ZodSchema } from '../../schemas'
import tsconfig from '@app/core/tsconfig.json'
import { a, includesAny, uppercaseFirstChar } from '../../utils/stringUtils'
import { errorOnce } from '../../utils/commonUtils'

/* --- Re-exports ------------------------------------------------------------------------------ */

export * from '../../utils/stringUtils'
export * from './createPrompts'

/* --- Types ----------------------------------------------------------------------------------- */

export type HINTED_METHODS = ALLOWED_METHODS | HintedKeys

export type SchemaFileMeta = {
    /** -i- The actual zod schema @warn ⚠️ Might be missing / empty when run in generator context @deprecated */
    schema?: ZodSchema | {}
    schemaPath: string
    schemaName: string
    schemaFileName: string
    schemaOption: string
    workspacePath: string
    workspaceName: string
    isNamedExport: boolean
    isDefaultExport: boolean
}

export type FetcherFileMeta = {
    resolverName: string
    fetcherName: string
    fetcherType: 'query' | 'mutation'
}

export type BridgeFileMeta = {
    /** -i- The actual DataBridge object @warn ⚠️ Might be missing / empty when run in generator context @deprecated */
    bridge?: DataBridgeType | {}
    bridgePath: string
    bridgeName: string
    bridgeOption: string
    bridgeInputOption: string
    workspacePath: string
    workspaceName: string
    resolverName: string
    resolverType: 'query' | 'mutation'
    operationType: 'add' | 'update' | 'delete' | 'get' | 'list' | 'search'
    fetcherName: string
    inputSchemaName: string
    outputSchemaName: string
    allowedMethods: ALLOWED_METHODS[]
    isNamedExport: boolean
    isDefaultExport: boolean
    isMutation: boolean
    isQuery: boolean
}

/** --- excludeDirs() -------------------------------------------------------------------------- */
/** -i- Filter function to exclude folders and directories */
export const excludeDirs = (pth: string) => pth.split('/').pop()?.includes('.')

/** --- excludeModules() ----------------------------------------------------------------------- */
/** -i- Filter function to exclude node_modules folders */
export const excludeModules = (pth: string) => !pth.includes('node_modules')

/** --- normalizeName() ------------------------------------------------------------------------ */
/** -i- Make sure only lowercase and uppercase letters are left in a given string */
export const normalizeName = (str: string) => str.replace(/[^a-zA-Z]/g, '')

/** --- matchMethods() ------------------------------------------------------------------------- */
/** -i- Checks that a certain method (like `'GET'`, `'POST'`, ...) is included in list of method names */
export const matchMethods = (methods: HINTED_METHODS[], method: HINTED_METHODS) => {
    return methods.includes(method)
}

/** --- globRel() ------------------------------------------------------------------------------ */
/** -i- Gets the relative glob path of a glob-style selector with globSync */
export const globRel = (globPath: string) => {
    // Check that the glob path contains one of our workspace folder locations
    const workspaceFoldersRegex = /features|packages|apps/
    if (!workspaceFoldersRegex.test(globPath)) {
        throw new Error([
            `The glob path passed to globRel() should contain either`,
            `'/features/', '/packages/' or '/apps/'...\n`,
            `Instead we received: ${globPath}`,
        ].join(' '))
    }
    // Get all matches
    const rawMatches = globSync(globPath, { absolute: true })
    // Filter out any node_modules files if present
    const allMatches = rawMatches.filter(excludeModules).map(p => p.replaceAll('\\', '/'))
    // Determine the folder level from the glob path
    const folderLevel = globPath.split(workspaceFoldersRegex)?.[0] || '../../'
    // Determine the absolute root dir where our app starts
    const [absoluteRootDir] = __dirname.replaceAll('\\', '/').split('packages/@green-stack-core/scripts')
    // Replace the root app dir with the folder level
    return allMatches.map((match) => match.replace(absoluteRootDir, folderLevel).replaceAll('\\', '/'))
}

/** --- createDivider() ------------------------------------------------------------------------ */
/** -i- Creates a code divider that's always 100 chars wide */
export const createDivider = (title: string, isDocDivider = false) => {
    const baseTemplate = isDocDivider ? `/** --- ${title}  */` : `/* --- ${title}  */`
    const remainingSpace = 100 - baseTemplate.length - 1
    const remainingDashes = '-'.repeat(remainingSpace)
    return baseTemplate.replace(`${title}  */`, `${title} ${remainingDashes} */`)
}

/** --- hasOptOutPatterns() -------------------------------------------------------------------- */
/** -i- Checks if file content has opt-out patterns so we know to ignore the file when present */
export const hasOptOutPatterns = (fileContents: string) => {
    const hasOptOutExport = fileContents.includes('export const optOut = true')
    const hasOptOutComment = fileContents.includes('@automation optOut')
    return hasOptOutExport || hasOptOutComment
}

/** --- includesOption() ----------------------------------------------------------------------- */
/** -i- HoC to prefill a list of options that are checked against in the actual filter method
 * @example ```
 *  const includesGetOrPost = includesOption(['GET', 'POST'])
 *  // => Creates filter method
 *  const result = ['GET', 'POST', 'PUT'].filter(includesGetOrPost)
 *  // => ['GET', 'POST']
 * ``` */
export const includesOption = (options: string[]) => {
    return (opt: string) => options.some((option) => opt.includes(option))
}

/** --- validateNonEmptyNoSpaces() ------------------------------------------------------------- */
/** -i- Validates that a string is not empty and does not contain spaces, returns error message if it does */
export const validateNonEmptyNoSpaces = (input: string) => {
    if (!input) return 'Please enter a non-empty value'
    if (input.includes(' ')) return 'Please enter a value without spaces'
    return true
}

/** --- maybeImport() -------------------------------------------------------------------------- */
/** -i- Attempts to `require()` a file, but returns an empty object if it fails / file doesn't exist. @warn ⚠️ Will always return empty object within turbo generators, but will work in scripts */
export const maybeImport = (path: string, onError: 'logErrors' | 'throwErrors' | 'ignoreErrors' = 'ignoreErrors') => {
    try {
        const importedModule = require(path)
        return importedModule || {}
    } catch (error) {
        if (onError === 'logErrors') console.log(error)
        if (onError === 'throwErrors') throw error
        return {}
    }
}

/** --- parseWorkspaces() ---------------------------------------------------------------------- */
/** -i- Figure out all info about all workspaces and return mapped linking info for use in scripts */
export const parseWorkspaces = (
    folderLevel = '../../',
    includeApps = false,
) => {
    
    // Get all workspace package.json paths
    const appConfigPaths = includeApps ? globRel(`${folderLevel}apps/**/package.json`).filter(excludeModules) : [] // prettier-ignore
    const packageConfigPaths = globRel(`${folderLevel}packages/**/package.json`).filter(excludeModules) // prettier-ignore
    const featureConfigPaths = globRel(`${folderLevel}features/**/package.json`).filter(excludeModules) // prettier-ignore
    const packageJSONPaths = [...appConfigPaths, ...packageConfigPaths, ...featureConfigPaths]

    // Map to keep track of all workspace package configs, filled in next step
    const workspaceConfigs = {} as Record<string, any>
    const pkgConfigs = {} as Record<string, any>

    // Build a map of workspace imports as { [workspacePath]: workspacePackage, ... }
    const workspaceImports = packageJSONPaths.reduce((acc, packageJsonPath) => {
        const packageJsonString = fs.readFileSync(packageJsonPath, 'utf8')
        const packageJsonLines = packageJsonString.split('\n')
        const __tabSize = packageJsonLines[1].split('"')[0].length
        const packageJSON = JSON.parse(packageJsonString)
        const workspaceMatcher = packageJsonPath.replace(`${folderLevel}`, '').replace('/package.json', '')
        workspaceConfigs[workspaceMatcher] = { ...packageJSON, __tabSize }
        pkgConfigs[packageJSON.name] = { ...packageJSON, __tabSize }
        return { ...acc, [workspaceMatcher]: packageJSON.name }
    }, {}) as Record<string, string>

    // Reverse that map to get a map of workspace packages as { [workspacePackage]: workspacePath, ... }
    const workspacePathsMap = Object.entries(workspaceImports).reduce((acc, [wsPath, pkgName]) => {
        return { ...acc, [pkgName]: wsPath }
    }, {}) as Record<string, string>

    // Other info we might need (sorted by preferred transpilation order > packages first, then features)
    const sortByOrder = (a: string, b: string) => (a.includes('packages') && !b.includes('packages') ? -1 : 1) // prettier-ignore
    const workspacePaths = Object.keys(workspaceImports).sort(sortByOrder)
    const workspacePackages = workspacePaths.map((path) => workspaceImports[path])
  
    // Return all the info we've gathered
    return {

        /** -i- Map of { [path]: package.json config, ... } */
        workspaceConfigs,
        /** -i- Map of { [path]: pkgName, ... } */
        workspaceImports,
        /** -i- Map of { [pkgName]: path, ... } */
        workspacePathsMap,
        /** -i- Array of all workspace paths, e.g. ["packages/@green-stack-core", ...]  */
        workspacePaths,
        /** -i- Array of all workspace packages, e.g. ["@green-stack/core", ...] */
        workspacePackages,

        // -- Aliases & Constants --

        /** -i- Map of { [path]: package.json config, ... } */
        PATH_CONFIGS: workspaceConfigs,
        /** -i- Map of { [pkgName]: package.json config, ... } */
        PKG_CONFIGS: pkgConfigs,
        /** -i- Map of { [path]: pkgName, ... } */
        PATH_PKGS: workspaceImports,
        /** -i- Map of { [pkgName]: path, ... } */
        PKG_PATHS: workspacePathsMap,

    }
}

/** --- opt() --------------------------------------------------------------------------------- */
/** -i- Format a CLI option */
export const opt = (option: string, greyOut = false) => {
    const renderOption = (label: string) => greyOut ? a.muted(label) : a.bold(label)
    // Keep as is if it's short
    if (!option.includes(' -- ')) return renderOption(` ${option}`)
    // Split into hierarchical parts
    const [key, descr] = option.split(' -- ')
    // Format the key
    return renderOption(`${a.bold(key)} ${a.muted(`-- ${descr}`)}`)
}

/** --- getWorkspaceOptions() ------------------------------------------------------------------ */
/** -i- List all the available workspaces for generators to use (map of options to workspace paths)
 * @example ```
 *  const workspaceOptions = getWorkspaceOptions('./')
 *  // => {
 *  //  "features/@app-core  --  importable from: '@app/core'":
 *  //      'features/@app-core',
 *  //  ...
 *  // }
 * ``` */
export const getWorkspaceOptions = (folderLevel = '../../', options: {
    filter?: string[]
    exclude?: string[]
    excludePackages?: boolean
    includeApps?: boolean
    includeGreenStack?: boolean
    skipFormatting?: boolean
    prefer?: string[]
} = {}) => {
    const {
        filter = [],
        exclude = [],
        excludePackages = false,
        includeApps = false,
        includeGreenStack = false,
        skipFormatting = false,
        prefer = [],
    } = options
    const { workspaceImports } = parseWorkspaces(folderLevel, includeApps)
    if (excludePackages) exclude.push('packages/')
    // Sort by preference or maintain original order?
    const optionKeys = Object.keys(workspaceImports)
    const workspaceOptions = optionKeys.sort((a, b) => {
        const getScore = (path: string) => {
            const index = optionKeys.indexOf(path)
            if (!prefer?.length) return index
            const fullOption = [path, workspaceImports[path]].join(' ')
            const match = prefer.find((pref) => fullOption.includes(pref))
            if (!match) return index
            const preferIndex = prefer.indexOf(match)
            const preferScore = (prefer.length - preferIndex) * 10
            return index + preferScore
        }
        return getScore(b) - getScore(a)
    })
    // Map the workspace options to their paths
    return workspaceOptions.reduce((options, workspacePath) => {
        const workspaceName = workspaceImports[workspacePath]
        let workspaceOption = `${workspaceName}  --  from ${a.bold(workspacePath)}`
        // Skip listing the helper workspaces
        const skippedHelpers = [!includeGreenStack && 'green-stack', 'registries'].filter(Boolean) as string[]
        if (skippedHelpers.some(helper => workspaceName.includes(helper))) return options
        // Add the workspace option if not excluded or if it matches the filter
        const isFiltered = filter.length ? filter.some((f) => workspaceOption.includes(f)) : true
        const isExcluded = exclude.length ? exclude.some((e) => workspaceOption.includes(e)) : false
        if (isExcluded || !isFiltered) return options
        // Format the option before adding it?
        if (!skipFormatting) workspaceOption = opt(workspaceOption)
        return { ...options, [workspaceOption]: workspacePath }
    }, {}) as Record<string, string>
}

/** --- getAvailableSchemas() ------------------------------------------------------------------ */
/** -i- List all the available schemas in the codebase that generators can use */
export const getAvailableSchemas = (
    folderLevel = '../../',
    options: {
        schemaKeyToUse?: 'schemaName' | 'schemaPath' | 'schemaOption',
        includeOptOut?: boolean,
    } = {
        schemaKeyToUse: 'schemaName',
        includeOptOut: false,
    }
) => {
    
    // Destructure the options
    const { schemaKeyToUse = 'schemaName', includeOptOut } = options

    // Get workspace imports
    const { workspaceImports } = parseWorkspaces(folderLevel)
    const schemaRegistry = maybeImport('@app/registries/schemas.generated.ts')
  
    // Get paths of all schemas
    const packageSchemaPaths = globRel(`${folderLevel}packages/**/schemas/[A-Z]*.ts`).filter(excludeModules)
    const featureSchemaPaths = globRel(`${folderLevel}features/**/schemas/[A-Z]*.ts`).filter(excludeModules)
    const allSchemaPaths = [...packageSchemaPaths, ...featureSchemaPaths].filter((pth) => {
        return !['@green-stack-core/schemas/', 'createSchema', '.bridge', '.resolver', '.enum'].some((excluded) => pth.includes(excluded))
    })
  
    // Map to build list of available resolvers to integrate with
    const availableSchemas = allSchemaPaths.reduce((acc, schemaPath) => {

        // Figure out the schema name and contents
        const schemaFileName = schemaPath.split('/').pop()!.replace('.ts', '')
        const schemaName = schemaFileName.split('.').shift()!
        const workspacePath = schemaPath.split('/schemas/')?.[0]?.replace(`${folderLevel}`, '')
        const workspaceName = workspaceImports[workspacePath]
        
        // Skip if the file has opt-out patterns
        const fileContents = fs.readFileSync(schemaPath, 'utf8')
        if (!includeOptOut && hasOptOutPatterns(fileContents)) return acc

        // Check if there is a schema registry entry for this schema
        const schemaRegistryEntry = schemaRegistry[schemaName] || {}

        // Stop if the schema is not exported of not found due to name not matching
        const isNamedExport = fileContents.includes(`export const ${schemaName}`)
        const isDefaultExport = fileContents.includes(`export default ${schemaName}`)
        if (!isNamedExport && !isDefaultExport) return acc

        // Build the option to display in the CLI
        const schemaOption = `${workspaceName} - ${schemaName} ${a.bold(a.muted('(♻ - Schema)'))}`
  
        // Figure out the schema key to use
        const schemaKey = schemaKeyToUse === 'schemaName'
            ? schemaName
            : schemaKeyToUse === 'schemaPath'
            ? schemaPath
            : schemaOption

        // Add the schema to the list of available schemas
        return {
            ...acc,
            [schemaKey]: {
                schema: schemaRegistryEntry,
                schemaPath: schemaPath?.replace(`${folderLevel}`, ''),
                schemaName,
                schemaFileName,
                schemaOption,
                workspacePath,
                workspaceName,
                isNamedExport,
                isDefaultExport,
            },
        }
    }, {}) as Record<string, Prettify<SchemaFileMeta>>

    return availableSchemas
}

/** --- getAvailableDataBridges() -------------------------------------------------------------- */
/** -i- List all the available data bridges for generators to use */
export const getAvailableDataBridges = (
    folderLevel = '../../',
    options: {
        filterType?: 'query' | 'mutation',
        allowNonGraphql?: false,
        includeOptOut?: boolean,
        bridgeKey?: 'bridgeName' | 'bridgePath' | 'bridgeOption' | 'bridgeInputOption'
    } = {
        filterType: undefined,
        allowNonGraphql: false,
        includeOptOut: false,
        bridgeKey: 'bridgeName',
    },
) => {

    // Destructure the options
    const { filterType, allowNonGraphql, includeOptOut, bridgeKey = 'bridgeName' } = options

    // Get workspace imports
    const { workspaceImports } = parseWorkspaces(folderLevel)
    const bridgeRegistry = maybeImport('@app/registries/bridges.generated.ts')

    // Get paths of all Data Bridges
    const packageBridgePaths = globRel(`${folderLevel}packages/**/resolvers/**.bridge.ts`).filter(excludeModules)
    const featureBridgePaths = globRel(`${folderLevel}features/**/resolvers/**.bridge.ts`).filter(excludeModules)
    const allDataBridgePaths = [...packageBridgePaths, ...featureBridgePaths].filter((pth) => !pth.includes('createDataBridge'))

    // Get path of all Fetchers
    const packageQueryPaths = globRel(`${folderLevel}packages/**/resolvers/**.query.ts`).filter(excludeModules)
    const featureQueryPaths = globRel(`${folderLevel}features/**/resolvers/**.query.ts`).filter(excludeModules)
    const packageMutationPaths = globRel(`${folderLevel}packages/**/resolvers/**.mutation.ts`).filter(excludeModules)
    const featureMutationPaths = globRel(`${folderLevel}features/**/resolvers/**.mutation.ts`).filter(excludeModules)
    const allFetcherPaths = [...packageQueryPaths, ...featureQueryPaths, ...packageMutationPaths, ...featureMutationPaths]

    // Build lookup of available fetchers
    const availableFetchers = allFetcherPaths.reduce((acc, fetcherPath) => {

        // Skip files that have opt-out patterns
        const fetcherFileContents = fs.readFileSync(fetcherPath, 'utf8')
        if (!includeOptOut && hasOptOutPatterns(fetcherFileContents)) return acc
        
        // Figure out fetcher name and type
        const [resolverName, fetcherType] = fetcherPath.split('/').pop()!.split('.') as [string, 'query' | 'mutation']
        const fetcherName = fetcherFileContents.match(/export const (\w+) = bridgedFetcher\({/)?.[1]

        // Add to the list
        return {
            ...acc,
            [resolverName]: {
                resolverName,
                fetcherName: fetcherName || `${resolverName}${uppercaseFirstChar(fetcherType)}`,
                fetcherType,
            },
        }

    }, {} as Record<string, Prettify<FetcherFileMeta>>)

    // Map to build list of available resolvers to integrate with
    const availableDataBridges = allDataBridgePaths.reduce((acc, bridgePath) => {

        // Skip files that have opt-out patterns
        const bridgeFileContents = fs.readFileSync(bridgePath, 'utf8')
        if (!includeOptOut && hasOptOutPatterns(bridgeFileContents)) return acc

        // Figure out the bridge name and contents
        const bridgeName = bridgePath.split('/').pop()!.replace('.bridge.ts', 'Bridge')
        const workspacePath = bridgePath.split('/resolvers/')[0]?.replace(`${folderLevel}`, '')
        const workspaceName = workspaceImports[workspacePath]

        // Stop if the bridge is not exported of not found due to name not matching
        const isNamedExport = bridgeFileContents.includes(`export const ${bridgeName}`)
        const isDefaultExport = bridgeFileContents.includes(`export default ${bridgeName}`)
        if (!isNamedExport && !isDefaultExport) return acc

        // Figure out the resolver name
        const isCallingCreateDataBridge = bridgeFileContents.includes('createDataBridge(')
        const resolverName = bridgeFileContents.match(/resolverName: '(\w+)'/)?.[1]
        if (!isCallingCreateDataBridge || !resolverName) return acc

        // Is there related fetcher data?
        const relatedFetcher = availableFetchers[resolverName]

        // Is there a related bridge in the registry?
        const bridgeRegistryEntry = bridgeRegistry[bridgeName] || {}

        // Filter out queries or mutations?
        const allowedMethodsLine = bridgeFileContents.match(/allowedMethods: \[(.+)\]/)?.[1]
        const allowedMethods = allowedMethodsLine?.split(',').map((method) => method.replaceAll(`'`, '').trim())
        const hasGraphResolver = allowedMethodsLine?.includes('GRAPHQL')
        if (!allowNonGraphql && !hasGraphResolver) return acc
        let resolverType = bridgeFileContents.match(/resolverType: '(\w+)'/)?.[1] as 'query' | 'mutation'
        if (!resolverType) resolverType = relatedFetcher?.fetcherType
        const isMutation = bridgeFileContents.includes('isMutation: true') || allowedMethods?.some((method) => ['POST', 'PUT', 'DELETE'].includes(method))
        const isQuery = bridgeFileContents.includes('isMutation: false') || allowedMethods?.some((method) => ['GET'].includes(method))
        if (!resolverType && isMutation) resolverType = 'mutation'
        if (!resolverType && isQuery) resolverType = 'query'
        if (filterType && resolverType !== filterType) return acc

        // Determine operationType based on allowed methods or resolverName
        let operationType = '' as 'add' | 'update' | 'delete' | 'get' | 'list' | 'search'
        const resolvername = resolverName.toLocaleLowerCase()
        if (allowedMethods?.includes('POST') || includesAny(resolvername, ['add', 'create', 'insert'])) {
            operationType = 'add'
        } else if (allowedMethods?.includes('PUT') || includesAny(resolvername, ['update', 'edit', 'modify'])) {
            operationType = 'update'
        } else if (allowedMethods?.includes('DELETE') || includesAny(resolvername, ['delete', 'remove'])) {
            operationType = 'delete'
        } else if (allowedMethods?.includes('GET') || includesAny(resolvername, ['get', 'fetch', 'retrieve'])) {
            operationType = 'get'
        } else if (allowedMethods?.includes('LIST') || includesAny(resolvername, ['list', 'all'])) {
            operationType = 'list'
        } else if (allowedMethods?.includes('SEARCH') || includesAny(resolvername, ['search', 'find'])) {
            operationType = 'search'
        } else if (resolverType === 'query') {
            operationType = 'get' // Default to 'get' for queries
        } else if (resolverType === 'mutation') {
            operationType = 'update' // Default to 'update' for mutations
        }

        // Figure out the schema names
        const inputSchemaName = bridgeFileContents.match(/inputSchema: (\w+)/)?.[1]
        const outputSchemaName = bridgeFileContents.match(/outputSchema: (\w+)/)?.[1]

        // Build the option to display in the CLI
        const bridgeOption = `${workspaceName} >>> ${resolverName}() ${a.bold(a.muted('(♻ - Resolver)'))}`
        const bridgeInputOption = `${workspaceName} >>> ${resolverName}() ${a.bold(a.muted('(♻ - Input)'))}`

        // Build the list item
        const bridgeEntry = {
            bridge: bridgeRegistryEntry,
            bridgePath: bridgePath?.replace(`${folderLevel}`, ''),
            bridgeName,
            bridgeOption,
            bridgeInputOption,
            workspacePath: workspacePath?.replace(`${folderLevel}`, ''),
            workspaceName,
            resolverName,
            resolverType,
            operationType,
            fetcherName: relatedFetcher?.fetcherName || `${resolverName}${uppercaseFirstChar(resolverType)}`,
            inputSchemaName,
            outputSchemaName,
            allowedMethods,
            isNamedExport,
            isDefaultExport,
            isMutation,
            isQuery,
        }

        // Figure out the bridge key to use
        const bridgeKeyToUse = bridgeEntry[bridgeKey]

        // Add the bridge to the list of available bridges
        return { ...acc, [bridgeKeyToUse]: bridgeEntry }

    }, {}) as Record<string, Prettify<BridgeFileMeta>>

    return availableDataBridges
}

/** --- importAliases -------------------------------------------------------------------------- */
/** -i- Retrieve the import aliases from the main tsconfig.json in '@app/core' */
export const readImportAliases = (folderLevel = '../../') => {
    return Object.entries(tsconfig.compilerOptions.paths).reduce((acc, [alias, [path]]) => {
        const trimmedAlias = alias.replace('/*', '')
        const trimmedPath = path.replace('/*', '').replaceAll('../', '').replace('.tsx', '').replace('.ts', '')
        const { workspaceImports } = parseWorkspaces(folderLevel, true)
        const workspaceEntry = Object.entries(workspaceImports).find(([pathKey]) => {
            return trimmedPath.includes(pathKey)
        })
        if (!workspaceEntry) {
            errorOnce([
                `Could not find matching workspace for path: ${trimmedPath}.`,
                `You may need to specify / finetune the folder level in the function args.`,
            ].join(' '))
            return acc
        }
        const [workspacePath, workspaceName] = workspaceEntry!
        const importPath = trimmedPath.replace(workspacePath, workspaceName)
        return { ...acc, [importPath]: trimmedAlias }
    }, {} as Record<string, string>)
}

/** --- swapImportAlias() ---------------------------------------------------------------------- */
/** -i- Swap an import path with an alias if a match occurs */
export const swapImportAlias = (importPath: string, folderLevel = '../../') => {
    const importAliases = readImportAliases(folderLevel)
    const aliasMatch = Object.keys(importAliases).find((alias) => importPath.includes(alias))
    return aliasMatch ? importPath.replace(aliasMatch, importAliases[aliasMatch]) : importPath
}
