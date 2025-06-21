// @ts-ignore
import { test, expect } from 'bun:test'
import * as utils from './scriptUtils'

/* --- String utils ---------------------------------------------------------------------------- */

test('snakeToCamel() converts snake_case to camelCase', () => {
    const result = utils.snakeToCamel('snake_case')
    expect(result).toBe('snakeCase')
})

test('snakeToDash() converts snake_case to kebab-case', () => {
    const result = utils.snakeToDash('snake_case')
    expect(result).toBe('snake-case')
})

test('dashToCamel() converts kebab-case to camelCase', () => {
    const result = utils.dashToCamel('kebab-case')
    expect(result).toBe('kebabCase')
})

test('dashToSnake() converts kebab-case to snake_case', () => {
    const result = utils.dashToSnake('kebab-case')
    expect(result).toBe('kebab_case')
})

test('camelToSnake() converts camelCase to snake_case', () => {
    const result = utils.camelToSnake('camelCase')
    expect(result).toBe('camel_case')
})

test('camelToDash() converts camelCase to kebab-case', () => {
    const result = utils.camelToDash('camelCase')
    expect(result).toBe('camel-case')
})

test('uppercaseFirstChar() converts the first character of a string to uppercase', () => {
    const result = utils.uppercaseFirstChar('test')
    expect(result).toBe('Test')
})

test('lowercaseFirstChar() converts the first character of a string to lowercase', () => {
    const result = utils.lowercaseFirstChar('Test')
    expect(result).toBe('test')
})

test('replaceStringVars() replaces placeholders in a string with values from an object', () => {
    const result = utils.replaceStringVars('Hello {name}', { name: 'John' })
    expect(result).toBe('Hello John')
})

test('findTargetString() extracts a target string from a source string', () => {
    const result = utils.findTargetString(
        'some/path/to/specific-folder/icons/',
        'some/path/to/$target$/icons/',
    )
    expect(result).toBe('specific-folder')
})

test('replaceMany() replaces multiple strings in a source string with a replacement string', () => {
    const result1 = utils.replaceMany('useUpdateDataForm()', ['Update', 'Add'], '')
    expect(result1).toBe('useDataForm()')
    const result2 = utils.replaceMany('useAddUserForm()', ['Update', 'Add'], '')
    expect(result2).toBe('useUserForm()')
})


/* --- Script utils ---------------------------------------------------------------------------- */

test('excludeDirs() removes folders from a list of file paths', () => {
    const paths = ['a/b/c', 'a/b/c.ts', 'a/b/e', 'a/b/c.tsx']
    const result = paths.filter(utils.excludeDirs)
    expect(result).toEqual(['a/b/c.ts', 'a/b/c.tsx'])
})

test('excludeModules() removes node_modules folders from a list of file paths', () => {
    const paths = ['a/b/c', 'a/b/c.ts', 'a/b/node_modules', 'a/b/c.tsx']
    const result = paths.filter(utils.excludeModules)
    expect(result).toEqual(['a/b/c', 'a/b/c.ts', 'a/b/c.tsx'])
})

test('normalizeName() removes all non-letter characters from a string', () => {
    const result = utils.normalizeName('a1b2c3.,!@#')
    expect(result).toBe('abc')
})

test('matchMethods() checks if a method name is included in a list of method names', () => {
    const methods = ['GET', 'POST', 'GRAPHQL']
    const result = utils.matchMethods(methods, 'GET')
    expect(result).toBe(true)
})

test('includesOption() returns a filter method that checks if a string includes any of the options', () => {
    const includesGet = utils.includesOption(['GET', 'POST'])
    const result = ['GET', 'POST', 'PUT'].filter(includesGet)
    expect(result).toEqual(['GET', 'POST'])
})

test('createAutocompleteSource() returns a function that filters options based on input', () => {
    const autocompleteSource = utils.createAutocompleteSource(['GET', 'POST', 'PUT'])
    expect(autocompleteSource({}, 'P')).resolves.toEqual(['POST', 'PUT'])
    expect(autocompleteSource({}, 'G')).resolves.toEqual(['GET'])
    expect(autocompleteSource({}, 'PU')).resolves.toEqual(['PUT'])
})

test('validateNonEmptyNoSpaces() returns an error message if the input is empty or contains spaces', () => {
    expect(utils.validateNonEmptyNoSpaces('')).toBe('Please enter a non-empty value')
    expect(utils.validateNonEmptyNoSpaces('with spaces')).toBe('Please enter a value without spaces')
    expect(utils.validateNonEmptyNoSpaces('no-spaces')).toBe(true)
})

test('parseWorkspaces() returns all workspace info and mappings', () => {
    const {
        workspaceConfigs,
        workspaceImports,
        workspacePathsMap,
        workspacePaths,
        workspacePackages,
    } = utils.parseWorkspaces('./')
    // Verify we can retrieve the package.json config for the 'packages/@green-stack-core' workspace
    expect(workspaceConfigs['packages/@green-stack-core']).toBeDefined()
    expect(workspaceConfigs['packages/@green-stack-core'].name).toBe('@green-stack/core')
    // Check that the 'packages/@green-stack-core' workspace is mapped to the '@green-stack/core' package
    expect(workspaceImports['packages/@green-stack-core']).toBe('@green-stack/core')
    // Check that the '@green-stack/core' package is mapped to the 'packages/@green-stack-core' workspace
    expect(workspacePathsMap['@green-stack/core']).toBe('packages/@green-stack-core')
    // Check that the workspace paths work as expected
    expect(workspacePaths).toContain('packages/@green-stack-core')
    // Check that the workspace packages work as expected
    expect(workspacePackages).toContain('@green-stack/core')
})

test('parseWorkspaces() return constants for PATH_CONFIGS, PKG_CONFIGS, PATH_PKGS, and PKG_PATHS', () => {
    const {
        PATH_CONFIGS,
        PKG_CONFIGS,
        PATH_PKGS,
        PKG_PATHS,
    } = utils.parseWorkspaces('./')
    // Verify we can retrieve the package.json config for the 'packages/@green-stack-core' workspace
    expect(PATH_CONFIGS['packages/@green-stack-core']).toBeDefined()
    expect(PATH_CONFIGS['packages/@green-stack-core'].name).toBe('@green-stack/core')
    // Verify we can retrieve the package.json config for the '@green-stack/core' workspace
    expect(PKG_CONFIGS['@green-stack/core']).toBeDefined()
    expect(PKG_CONFIGS['@green-stack/core'].name).toBe('@green-stack/core')
    // Check that the 'packages/@green-stack-core' path is mapped to '@green-stack/core' package name
    expect(PATH_PKGS['packages/@green-stack-core']).toBe('@green-stack/core')
    // Check that the '@green-stack/core' package name is mapped to 'packages/@green-stack-core' path
    expect(PKG_PATHS['@green-stack/core']).toBe('packages/@green-stack-core')
})

test('getWorkspaceOptions() lists all available workspace path options for generators to use', () => {
    const workspaceOptions = utils.getWorkspaceOptions('./')
    // Check that the @green-stack/core package is omitted
    expect(workspaceOptions[utils.opt(`@green-stack/core  --  from ${utils.a.bold('packages/@green-stack-core')}`)]).toBeUndefined()
    // Check that the @app/core workspace is included
    expect(workspaceOptions[utils.opt(`@app/core  --  from ${utils.a.bold('features/@app-core')}`)]).toBe("features/@app-core")
})

test('getAvailableSchemas() lists all available schemas in the codebase for generators to use', () => {
    const schemaConfigMap = utils.getAvailableSchemas('./')
    // Check that the healthCheck input & output schemas are included
    expect(schemaConfigMap['HealthCheckInput']).toBeDefined()
    expect(schemaConfigMap['HealthCheckOutput']).toBeDefined()
    // Check that the config for the healthCheck input schema is correct
    const HealthCheckArgsInfo = schemaConfigMap['HealthCheckInput']
    expect(HealthCheckArgsInfo.schemaName).toBe('HealthCheckInput')
    expect(HealthCheckArgsInfo.schemaPath).toBe('features/@app-core/schemas/HealthCheckInput.ts')
    expect(HealthCheckArgsInfo.workspacePath).toBe('features/@app-core')
    expect(HealthCheckArgsInfo.workspaceName).toBe('@app/core')
    expect(HealthCheckArgsInfo.isNamedExport).toBe(true)
    expect(HealthCheckArgsInfo.isDefaultExport).toBe(false)
    // Check that the config for the healthCheck output schema is correct
    const HealthCheckResponseInfo = schemaConfigMap['HealthCheckOutput']
    expect(HealthCheckResponseInfo.schemaName).toBe('HealthCheckOutput')
    expect(HealthCheckResponseInfo.schemaPath).toBe('features/@app-core/schemas/HealthCheckOutput.ts')
    expect(HealthCheckResponseInfo.workspacePath).toBe('features/@app-core')
    expect(HealthCheckResponseInfo.workspaceName).toBe('@app/core')
    expect(HealthCheckResponseInfo.isNamedExport).toBe(true)
    expect(HealthCheckResponseInfo.isDefaultExport).toBe(false)
})

test('getAvailableDataBridges() lists all available DataBridges in the codebase for generators to use', () => {
    const dataBridgeConfigMap = utils.getAvailableDataBridges('./')
    // Check that the healthCheck DataBridge is included
    expect(dataBridgeConfigMap['healthCheckBridge']).toBeDefined()
    // Check that the config for the healthCheck DataBridge is correct
    const healthCheckBridgeInfo = dataBridgeConfigMap['healthCheckBridge']
    expect(healthCheckBridgeInfo.bridgePath).toBe('features/@app-core/resolvers/healthCheck.bridge.ts')
    expect(healthCheckBridgeInfo.bridgeName).toBe('healthCheckBridge')
    expect(healthCheckBridgeInfo.workspacePath).toBe('features/@app-core')
    expect(healthCheckBridgeInfo.workspaceName).toBe('@app/core')
    expect(healthCheckBridgeInfo.resolverName).toBe('healthCheck')
    expect(healthCheckBridgeInfo.isNamedExport).toBe(true)
    expect(healthCheckBridgeInfo.isDefaultExport).toBe(false)
})
