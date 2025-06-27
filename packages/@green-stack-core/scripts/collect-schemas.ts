import fs from 'fs'
import { getAvailableSchemas } from './helpers/scriptUtils'
import { isEmpty } from '../utils/commonUtils'

/* --- Constants ------------------------------------------------------------------------------ */

const genMsg = `// -i- Auto generated with "npx turbo run @green-stack/core#collect:schemas"\n`

/* --- collect-schemas ------------------------------------------------------------------------- */

const collectSchemas = () => {
    try {

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
        console.log('-----------------------------------------------------------------')
        console.log('-i- Successfully created schema registry at:')
        console.log('-----------------------------------------------------------------')
        console.log(' ✅ packages/@registries/schemas.generated.ts')

    } catch (error) {
        console.error("Error running script 'collect-schemas':", error)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

collectSchemas()
