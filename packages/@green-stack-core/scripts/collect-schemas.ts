import fs from 'fs'
import { getAvailableSchemas, globRel, excludeModules, parseWorkspaces, uppercaseFirstChar, createDivider } from './helpers/scriptUtils'
import { isEmpty } from '../utils/commonUtils'

/* --- Constants ------------------------------------------------------------------------------ */

const genMsg = `// -i- Auto generated with "npx turbo run @green-stack/core#collect:schemas"\n`

/* --- collect-schemas ------------------------------------------------------------------------- */

const collectSchemas = () => {
    try {

        // Get workspace imports
        const { workspaceImports } = parseWorkspaces('../../')

        /* -- 1. Schemas -- */

        // Figure out the available schemas
        const availableSchemas = getAvailableSchemas('../../', { includeOptOut: true })

        // Build the schema registry file
        const schemaRegistry = Object.values(availableSchemas).reduce((acc, schema) => {
            return `${acc}export { ${schema.schemaName} } from '${schema.workspaceName}/schemas/${schema.schemaFileName}'\n`
        }, genMsg)
    
        // Write barrel file to 'packages/@registries/schemas.generated.ts'?
        if (schemaRegistry.includes('export')) {
            fs.writeFileSync('../../packages/@registries/schemas.generated.ts', schemaRegistry)
        }

        // Log completion message
        console.log('\n-----------------------------------------------------------------')
        console.log('-i- Successfully created schema registry at:')
        console.log('-----------------------------------------------------------------')
        console.log(' ✅ packages/@registries/schemas.generated.ts')

        /* -- 2. Partials? -- */

        // Check if we should collect partial schemas from workspaces
        const packagePartialPaths = globRel(`../../packages/**/schemas/[A-Z]*.partial.ts`).filter(excludeModules)
        const featurePartialPaths = globRel(`../../features/**/schemas/[A-Z]*.partial.ts`).filter(excludeModules)
        const allPartialSchemaPaths = [...packagePartialPaths, ...featurePartialPaths]

        // Abort and put an empty partials config if there were no partial schemas to collect
        if (isEmpty(allPartialSchemaPaths)) {
            fs.writeFileSync('../../packages/@registries/schemas.partials.ts', [

                genMsg,
                `import { z } from '@green-stack/schemas'`,
                
                createDivider('Exports'),
                
                `export const partials = {} as Record<string, z.ZodRawShape>`,

            ].join('\n'))
            return
        }

        // Build the partial schema registry file
        const partialsLookup = allPartialSchemaPaths.reduce((acc, partialPath) => {

            // Figure out the schema name
            const schemaFileName = partialPath.split('/').pop()!.replace('.ts', '')
            const schemaName = schemaFileName.split('.').reverse()!.pop()!
            const SchemaName = uppercaseFirstChar(schemaName)

            // Determine import line + partial spread
            const workspacePath = partialPath.split('/schemas/')?.[0]?.replace(`../../`, '')
            const workspaceName = workspaceImports[workspacePath]
            const [pkgScopeOrName, ...restPkgName] = workspaceName.replace('@', '').replace('-', '').split('/')
            const workspacePrefix = [pkgScopeOrName, ...(restPkgName.map(uppercaseFirstChar))].join('')
            const importName = `${workspacePrefix}${uppercaseFirstChar(schemaName)}Fields`
            const importLine = `import * as ${importName} from '${workspaceName}/schemas/${schemaFileName}'`
            
            // Determine entries
            const partialSpread = `    ...${importName},`
            const partialEntry = `    ${SchemaName}: ${SchemaName}Partials,`

            // Append to registry
            return {
                [SchemaName]: {
                    SchemaName,
                    importLines: [...(acc[SchemaName]?.importLines || []), importLine],
                    partialSpreads: [...(acc[SchemaName]?.partialSpreads || []), partialSpread],
                    partialEntry,
                    partialDivider: createDivider(`Expansions > ${SchemaName}.schema`),
                }
            }

        }, {} as Record<string, {
            SchemaName: string,
            importLines: string[],
            partialSpreads: string[],
            partialEntry: string,
            partialDivider: string,
        }>)

        // Group all import lines
        const partialConfigs = Object.values(partialsLookup)
        const allImportLines = partialConfigs.flatMap(cfg => cfg.importLines)

        // Build final schema partials registry content
        const partialsRegistry = [

            `${genMsg}${allImportLines.join('\n')}\n`,

            ...Object.keys(partialsLookup).map((schemaName: string) => [

                `${partialsLookup[schemaName].partialDivider}\n`,

                `// -i- Expandable partial fields for the '${schemaName}' schema`,
                `export const ${schemaName}Partials = {`,
                    ...partialsLookup[schemaName].partialSpreads,
                `}\n`,
                
            ].join('\n')).flat(),

            `${createDivider('Exports')}\n`,

            `export const partials = {`,
                ...partialConfigs.map(cfg => cfg.partialEntry),
            `}\n`,

        ].join('\n')

        // Write barrel file to 'packages/@registries/schemas.partials.ts'
        fs.writeFileSync('../../packages/@registries/schemas.partials.ts', partialsRegistry)

        // Log completion message
        console.log(' ✅ packages/@registries/schemas.partials.ts')

    } catch (error) {
        console.error("Error running script 'collect-schemas':", error)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

collectSchemas()
