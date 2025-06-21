import fs from 'fs'
import { findTargetString } from '../utils/stringUtils'
import { excludeDirs, parseWorkspaces, globRel } from './helpers/scriptUtils'

/* --- constants ------------------------------------------------------------------------------- */

const genMsg = '// -i- Auto generated with "npx turbo run @green-stack/core#collect:generators"\n'

/* --- collect-generators ---------------------------------------------------------------------- */

const collectGenerators = () => {
  try {
    // Get all resolver file paths in the next app's api folder
    const featureGenerators = globRel('../../features/**/generators/*.ts').filter(excludeDirs)
    const packageGenerators = globRel('../../packages/**/generators/*.ts').filter(excludeDirs)
    const rawGenerators = [...featureGenerators, ...packageGenerators].filter((path) => !path.includes('.d.ts')) // prettier-ignore
    
    // Replace all before 'packages' or 'features' with '../../'
    const allGenerators = rawGenerators.map((path) => {
        const packageOrFeatureRegex = /packages|features/
        const [replaceTarget] = path.split(packageOrFeatureRegex)
        return path.replace(replaceTarget, '../../')
    })

    // Figure out import paths from each workspace
    const { workspaceImports } = parseWorkspaces()

    // Collect all generators into a registry
    const generatorRegistry = allGenerators.reduce((acc, generatorPath) => {
        // Figure out the workspace import
        const [packageParts, generatorParts] = generatorPath.split('/generators') as [string, string]
        const workspaceMatcher = packageParts.replace('../../', '')
        const workspacePackageName = workspaceImports[workspaceMatcher]
        const importPath = `${workspacePackageName}/generators${generatorParts.replace('.ts', '')}`
        
        // Skip files that don't use PlopTypes or a turbo generators
        const pathContents = fs.readFileSync(generatorPath, 'utf8')
        const usesPlopTypes = pathContents.includes('PlopTypes')
        const usesTurboGenerators = pathContents.includes('@turbo/gen')
        const exportLines = pathContents.split('\n').filter((line) => line.includes('export') && !line.includes('${'))
        const generatorExportLine = exportLines.find((line) => line.includes('export const register') && line.includes('Generator'))
        if (!usesPlopTypes || !usesTurboGenerators || !generatorExportLine) return acc

        // Extract the generator name
        const generatorName = findTargetString(generatorExportLine, 'export const $target$ =')
        return generatorName ? `${acc}export { ${generatorName} } from '${importPath}'\n` : acc
    }, genMsg)

    // Write barrel file to 'packages/@registries/generators-generated'
    fs.writeFileSync('../../packages/@registries/generators.generated.ts', generatorRegistry)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

/* --- init ------------------------------------------------------------------------------------ */

collectGenerators()
