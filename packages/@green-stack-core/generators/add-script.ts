/* eslint-disable import/no-anonymous-default-export */
import { PlopTypes } from '@turbo/gen'
import { a, createPrompts } from '@green-stack/core/scripts/helpers/scriptUtils'
import open from 'open'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Turborepo Generators at:
// -i- https://turbo.build/repo/docs/core-concepts/monorepos/code-generation 

/* --- Prompts --------------------------------------------------------------------------------- */

export const gen = createPrompts({

    upgrade: {
        type: 'confirm',
        message: [
            `${a.bold('This generator is a premium feature', true)}.\n`,
            `--------------------------------------------------------------------------------------`,
            `🚀 Upgrade to ${a.green('FullProduct.dev')} to unlock all generators, git plugins and support?`,
            `--------------------------------------------------------------------------------------\n\n`,
        ].join('\n'),
    }

})

/** --- Script Generator ----------------------------------------------------------------------- */
/** -i- Add a new script */
export const registerScriptGenerator = (plop: PlopTypes.NodePlopAPI) => {
    plop.setGenerator('script', {
        description: 'Add a new script',
        prompts: gen.prompts,
        actions: (data: GenAnswers) => {

            // Args
            const ctx = gen.parseAnswers(data)

            // -- Actions --
            
            if (ctx.upgrade) open('https://fullproduct.dev?v=demo-gen-add-script')

            // -- Generate --

            return [] as PlopTypes.ActionType[]
        },
    })
}
