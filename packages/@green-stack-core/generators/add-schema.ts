/* eslint-disable import/no-anonymous-default-export */
import { PlopTypes } from '@turbo/gen'
import { validateNonEmptyNoSpaces, getWorkspaceOptions, createDivider, a, createAutocompleteSource, parseWorkspaces } from '../scripts/helpers/scriptUtils'
import { createPrompts } from '../scripts/helpers/scriptUtils'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Turborepo Generators at:
// -i- https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

/* --- Usage ----------------------------------------------------------------------------------- */

// -i- npm run add:schema -- --args <workspacePath> <schemaName> <schemaDescription>
// -i- npx turbo gen schema --args <workspacePath> <schemaName> <schemaDescription>

/* --- Constants ------------------------------------------------------------------------------- */

const { PATH_PKGS } = parseWorkspaces('./')
const workspaceOptions = getWorkspaceOptions('./')

/* --- Prompts --------------------------------------------------------------------------------- */

export const gen = createPrompts({

    workspacePath: {
        type: 'autocomplete',
        message: 'Where would you like to add this schema?', // @ts-ignore
        choices: workspaceOptions,
    },
    schemaName: {
        type: 'input',
        message: 'What is the schema name?',
    },
    schemaDescription:{
        type: 'input',
        message: 'Optional description: What data structure does this schema describe?',
    },

}, {

    compute: {
        schemaName: {
            validate: validateNonEmptyNoSpaces,
        },
    },

    parser: (answers) => {

        // Args
        const { workspacePath, schemaName, schemaDescription } = answers!

        // -- Vars --

        const workspacePkg = PATH_PKGS[workspacePath]
        const descriptions = [] as string[]
        const schemaFields = [] as string[]

        let jsDocDescription = ''
        let jsDocTitle = ''
        let describeStatement = ''

        // -- Optionals --

        if (schemaDescription) {
            descriptions.push(`${schemaName}: \`${schemaDescription}\`,`)
            jsDocDescription = `/** -i- ${schemaDescription} */`
            jsDocTitle = createDivider(schemaName, true)
            describeStatement = `.describe(d)`
        } else {
            jsDocTitle = createDivider(schemaName, false)
        }

        // -- Return --

        return {
            ...answers,
            workspacePkg,
            descriptions,
            schemaFields,
            jsDocDescription,
            jsDocTitle,
            describeStatement,
        }

    }

})

/* --- Types ----------------------------------------------------------------------------------- */

type Answers = typeof gen._values
type Context = typeof gen._parsed

/** --- createSchemaContent() ------------------------------------------------------------------ */
/** -i- Builds the file contents for a new schema based on passed metadata */
export const createSchemaContent = (ctx: Context) => [

    `import { z, schema } from '@green-stack/schemas'\n`,

    `${createDivider('Description')}\n`,

    `const d = "${ctx.schemaDescription}"\n`,

    [ctx.jsDocTitle, ctx.jsDocDescription].filter(Boolean).join('\n'),
    `export const ${ctx.schemaName} = schema('${ctx.schemaName}', {`,
        ctx.schemaFields.map((l) => `    ${l}`).join('\n'),
    `})${ctx.describeStatement}\n`,

    `${createDivider('Type Alias')}\n`,

    `export type ${ctx.schemaName} = z.input<typeof ${ctx.schemaName}>\n`,

].join('\n')

/** --- Schema Generator ----------------------------------------------------------------------- */
/** -i- Add a new zod schema as a single source of truth */
export const registerSchemaGenerator = (plop: PlopTypes.NodePlopAPI) => {
    plop.setGenerator('schema', {
        description: 'Add a new zod schema as a single source of truth',
        prompts: gen.prompts,
        actions: (answers: GenAnswers) => {
            
            const ctx = gen.parseAnswers(answers)

            // -- Build schema --

            const schemaContent = createSchemaContent(ctx)

            // -- Actions --

            const actions = [
                {
                    type: 'add',
                    path: `${ctx.workspacePath}/schemas/${ctx.schemaName}.schema.ts`,
                    template: schemaContent,
                },
                {
                    type: 'open-files-in-vscode',
                    paths: [`${ctx.workspacePath}/schemas/${ctx.schemaName}.schema.ts`],
                },
            ] as PlopTypes.ActionType[]

            // -- Generate --

            return actions
        },
    })
}
