/* eslint-disable import/no-anonymous-default-export */
import { PlopTypes } from '@turbo/gen'
import { a, validateNonEmptyNoSpaces } from '../scripts/helpers/scriptUtils'
import { createPrompts } from '../scripts/helpers/scriptUtils'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Turborepo Generators at:
// -i- https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

/* --- Usage ----------------------------------------------------------------------------------- */

// -i- npm run add:workspace -- --args <workspaceType> <folderName> <packageName> <workspaceStructure> <packageDescription>
// -i- npx turbo gen add-workspace --args <workspaceType> <folderName> <packageName> <workspaceStructure> <packageDescription>

/* --- Constants ------------------------------------------------------------------------------- */

const WORKSPACE_FOLDER_MAPPER = {
    feature: 'features',
    package: 'packages',
} as const

/* --- Prompts --------------------------------------------------------------------------------- */

export const gen = createPrompts({

    workspaceType: {
        type: 'list',
        message: 'What type of workspace would you like to generate?',
        choices: Object.keys(WORKSPACE_FOLDER_MAPPER),
        default: 'feature',
    },
    folderName: {
        type: 'input',
        message: 'What foldername do you want to give this workspace?',
    },
    packageName: {
        type: 'input',
        message: `What package name would you like to import from? ${a.muted('(used for package.json)')}`,
    },
    workspaceStructure: {
        type: 'checkbox',
        message: `Optional: What will this workspace contain? ${a.muted('(optional extra folder setup)')}`,
        choices: ['schemas', 'resolvers', 'components', 'hooks', 'screens', 'routes', 'utils'],
    },
    packageDescription: {
        type: 'input',
        message: `Optional: How would you shortly describe the package? ${a.muted('(used for package.json)')}`,
        default: 'todo: add description',
    },

}, {

    compute: {
        folderName: {
            validate: validateNonEmptyNoSpaces,
        },
        packageName: {
            validate: validateNonEmptyNoSpaces,
        },
    },

    parser: (answers) => {

        // Args
        const { workspaceType, folderName, packageName } = answers

        // -- Vars --

        const workspaceFolder = WORKSPACE_FOLDER_MAPPER[workspaceType as keyof typeof WORKSPACE_FOLDER_MAPPER] // prettier-ignore
        const workspacePath = `${workspaceFolder}/${folderName}`
        const isFeature = workspaceType === 'feature'

        const usesCustomLicense = ['green-stack'].some((word) => packageName.includes(word))
        let packageLicense = isFeature ? 'MIT' : 'UNLICENSED'
        if (usesCustomLicense) packageLicense = 'SEE LICENSE IN LICENSE.md'
        const isPrivate = isFeature || usesCustomLicense
        const privateLine = isPrivate ? '\n    "private": true,' : ''

        // -- Return --

        return {
            ...answers,
            workspaceFolder,
            workspacePath,
            isFeature,
            isPrivate,
            usesCustomLicense,
            packageLicense,
            privateLine,
        }
    },

})

/* --- Types ----------------------------------------------------------------------------------- */

type Answers = typeof gen._values
type Context = typeof gen._parsed

/* --- Templates ------------------------------------------------------------------------------- */

const tsConfigTemplate = `{
    "extends": "@app/core/tsconfig",
    "include": [
        "**/*.ts",
        "**/*.tsx",
        "../../apps/next/next-env.d.ts",
        "../../packages/@green-stack-core/global.d.ts",
        "../../features/@app-core/nativewind-env.d.ts",
        "../../features/@app-core/appConfig.ts",
        "../../features/**/*.ts",
        "../../features/**/*.tsx",
    ],
    "exclude": ["node_modules"]
}`

/** --- Workspace Generator -------------------------------------------------------------------- */
/** -i- Simple generator to add a new feature or package workspace */
export const registerWorkspaceGenerator = (plop: PlopTypes.NodePlopAPI) => {
    plop.setGenerator('add-workspace', {
        description: 'Create a new feature or package workspace',
        prompts: gen.prompts,
        actions: (data: GenAnswers) => {

            // Context
            const ctx = gen.parseAnswers(data)            
            
            // -- Actions --
            
            const actions = [
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/package.json`,
                    templateFile: '../../packages/@green-stack-core/generators/templates/package-json.hbs',
                    data: ctx,
                },
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/tsconfig.json`,
                    template: tsConfigTemplate,
                }
            ] as PlopTypes.ActionType[]
            
            // -- Helpers --
            
            const addOptionalStructure = (folderName: string, file: string) => {
                if (ctx.workspaceStructure.includes(folderName)) {
                    actions.push({
                        type: 'add',
                        path: `${ctx.workspacePath}/${folderName}/${file}`,
                    })
                }
            }
            
            // -- Optionals --
            
            addOptionalStructure('schemas', '.gitkeep')
            addOptionalStructure('resolvers', '.gitkeep')
            addOptionalStructure('components', '.gitkeep')
            addOptionalStructure('hooks', '.gitkeep')
            addOptionalStructure('screens', '.gitkeep')
            addOptionalStructure('routes', '.gitkeep')
            addOptionalStructure('utils', '.gitkeep')
            
            // -- Generate --
            
            return [
                ...actions,
                {
                    type: 'open-files-in-vscode',
                    paths: [`${ctx.workspacePath}/package.json`],
                },
                { type: 'install' },
            ]
        },
    })
}
