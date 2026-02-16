/* eslint-disable import/no-anonymous-default-export */
import { PlopTypes } from '@turbo/gen'
import { parseWorkspaces, a } from '../scripts/helpers/scriptUtils'
import { createPrompts } from '../scripts/helpers/scriptUtils'
import { execSync } from 'child_process'
import fs from 'fs'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Plop Generators at:
// -i- https://github.com/plopjs/plop

/* --- Usage ----------------------------------------------------------------------------------- */

// -i- npm run add:dependencies -- --args <workspacePkg> <dependencies> (pass _ to prompt for missing args)
// -i- npm run add:dependencies -- --workspacePkg @app/core --dependencies dep-1 dep-2 dep-3

/* --- Constants ------------------------------------------------------------------------------- */

const { workspacePackages } = parseWorkspaces('./', true)

/* --- Prompts --------------------------------------------------------------------------------- */

export const gen = createPrompts('add-dependencies', {

    workspacePkg: {
        type: 'autocomplete',
        message: `Where would you like to install these dependencies?`, // @ts-ignore
        choices: workspacePackages,
    },
    dependencies: {
        type: 'input',
        message: `Which dependencies should we install the Expo SDK compatible versions for? ${a.muted('(separated by spaces)')}`,
    },

}, {
    
    compute: {
        dependencies: {
            validate: (value) => !!value,
        },
    },

    parser: (answers) => {

        // Args
        const { workspacePkg } = answers!

        // -- Vars --

        const dependencies = answers!.dependencies.split(' ')
        const depList = dependencies.join(' ')

        // -- Return --

        return {
            workspacePkg,
            dependencies,
            depList,
        }

    },

})

/* --- Types ----------------------------------------------------------------------------------- */

type Answers = typeof gen._values
type Context = typeof gen._parsed

/** --- Dependency Installer ------------------------------------------------------------------- */
/** -i- Install Expo SDK compatible dependencies in a workspace */
export const registerDependencyGenerator = (plop: PlopTypes.NodePlopAPI) => {
    plop.setGenerator(gen.name, {
        description: 'Install Expo SDK compatible dependencies in a workspace',
        prompts: gen.prompts,
        actions: (data: GenAnswers) => {

            // Args
            const ctx = gen.parseAnswers(data)

            // Log out the dependencies
            console.log('\n', `> Installing Expo SDK compatible packages ${ctx.depList} in '${ctx.workspacePkg}' workspace`) // prettier-ignore

            // Read the @app/expo package json
            const originalExpoPackageJsonFile = fs.readFileSync(`apps/expo/package.json`, 'utf-8')
            const originalExpoPackageJson = JSON.parse(originalExpoPackageJsonFile) // prettier-ignore
            const originalDeps = originalExpoPackageJson.dependencies

            // Install the new dependencies in @app/expo
            const output = execSync(`npm -w @app/expo run add-dependencies ${ctx.depList}`) // prettier-ignore
            const loggableOutput = output.toString().split('\n').slice(0, 9).join('\n')
            console.log(loggableOutput)

            // Extract the new dependencies from the package json
            const newExpoPackageJson = JSON.parse(fs.readFileSync(`apps/expo/package.json`, 'utf-8')) // prettier-ignore
            const newDeps = Object.entries<string>(newExpoPackageJson.dependencies).filter(([pkg]) => !originalDeps[pkg]) // prettier-ignore

            // Restore the old package json
            fs.writeFileSync(`apps/expo/package.json`, originalExpoPackageJsonFile)

            // Add the new dependencies to the chosen workspace
            const installStatements = newDeps.map(([pkg, v]) => `${pkg}@${v}`).join(' ')
            console.log(`> Moving ${installStatements} to '${ctx.workspacePkg}' workspace`)
            execSync(`npm -w ${ctx.workspacePkg} install ${installStatements} --force`)
            console.log(`> Install successfull`, '\n')

            // Log out the dependency list
            const lsOutput = execSync(`npm ls ${ctx.depList}`)
            console.log(lsOutput.toString())

            // Actions
            return []
        },
    })
}
