import fs from 'fs'
import { addSetItem } from '@green-stack/utils/arrayUtils'
import { parseWorkspaces, globRel, createDivider } from '@green-stack/scripts/helpers/scriptUtils'

/* --- Types ----------------------------------------------------------------------------------- */

type ModelRegistry = {
    modelImportLines: string[],
    modelAliasEntryLines: string[],
}

/** --- createModelsRegistryContent() ---------------------------------------------------------- */
/** -i- Create the file contents for the model registry */
export const createModelsRegistryContent = (ctx: {
    modelImportLines: string[],
    modelAliasEntryLines: string[],
}) => [

    `// -i- Auto generated with "npx turbo run @db/driver#collect-models"`,
    `${ctx.modelImportLines.join('\n')}\n`,

    `${createDivider('Reexports')}\n`,

    `export {`,
        ctx.modelAliasEntryLines.join(',\n'),
    `}\n`,

    `${createDivider('Models')}\n`,

    `const dbModels = {`,
        ctx.modelAliasEntryLines.join(',\n'),
    `}\n`,

    `${createDivider('Exports')}\n`,

    `export type DB_MODEL = keyof typeof dbModels\n`,

    `export default dbModels\n`,

].join('\n')

/* --- collect-models -------------------------------------------------------------------------- */

const collectModels = () => {
    try {
        // Get all model file paths in /features/ & /packages/ workspaces
        const featureModelPaths = globRel('../../features/**/models/*.model.ts')
        const packageModelPaths = globRel('../../packages/**/models/*.model.ts')
        const allModelPaths = [...featureModelPaths, ...packageModelPaths]

        // Figure out import paths from each workspace
        const { workspaceImports } = parseWorkspaces()

        // Build overview of lines to build model registry files with
        const modelRegistry = allModelPaths.reduce((acc, modelFilePath) => {
            
            // Skip if not a valid model
            const modelFileContents = fs.readFileSync(modelFilePath, 'utf-8')
            const isValidModel = modelFileContents.includes('export const driverModel = validateDriverModel(')
            if (!isValidModel) return acc

            // Figure out model workspace from filename
            const workspaceEntry = Object.entries(workspaceImports).find(([pathKey]) => {
                return modelFilePath.includes(pathKey)   
            })

            // Figure out model name from filename
            const [workspacePath, modelWorkspace] = workspaceEntry!
            const innerModelFilePath = modelFilePath.split(workspacePath)[1]
            const modelFilename = innerModelFilePath.replace('/models/', '')
            const modelFileModuleName = modelFilename.replace('.tsx', '').replace('.ts', '')
            const [modelName] = modelFileModuleName.split('.')
            const modelImportPath = `${modelWorkspace}/models/${modelFilename}`
            const modelImportLine = `import { driverModel as ${modelName} } from '${modelImportPath}'` // prettier-ignore
            const modelModuleAliasLine = `    ${modelName}`
            
            // Add to the accumulator
            return {
                modelImportLines: addSetItem(acc.modelImportLines, modelImportLine),
                modelAliasEntryLines: addSetItem(acc.modelAliasEntryLines, modelModuleAliasLine),
            }

        }, {} as ModelRegistry)

        // Build models.generated.ts file
        const modelsFileContent = createModelsRegistryContent({
            modelImportLines: modelRegistry.modelImportLines,
            modelAliasEntryLines: modelRegistry.modelAliasEntryLines,
        })
        fs.writeFileSync('../../packages/@registries/models.generated.ts', modelsFileContent)

    } catch (err) {
        console.log(err)
        console.error(err)
        process.exit(1)
    }
}

/* --- init ------------------------------------------------------------------------------------ */

collectModels()
