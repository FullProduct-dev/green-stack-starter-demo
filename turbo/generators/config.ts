/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */
import fs from 'fs'
import path from 'path'
import { PlopTypes } from '@turbo/gen'
import { execSync } from 'child_process'
import * as workspaceGenerators from '../../packages/@registries/generators.generated'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Turborepo Generators at:
// -i- https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

// -i- Skipping Deprecation Warnings because: not caused by us, don't break anything, adds noise
// -i- We may fix this with a version bump in the future, but for now we just want to skip them
const originalEmit = process.emit
process.emit = (name, ...args) => {
    const [data] = args
    const isNamedWarning = name === 'warning' && typeof data === 'object' && data.name
    const SKIPPED_WARNINGS = ['DeprecationWarning']
    if (isNamedWarning && SKIPPED_WARNINGS.includes(data.name)) return false
    return originalEmit.call(process, name, ...args)
}

// -i- Turborepo & Plop don't play well with CommonJS modules like custom inquirer prompts
// -i- They require everything to run synchronously, so we need 'import-sync' instead of 'require'

import importSync from 'import-sync'
const { default: autocomplete } = importSync('inquirer-autocomplete-prompt')

/* --- Types ----------------------------------------------------------------------------------- */

export type AppendActionConfig = PlopTypes.ActionConfig & {
    path: string
    template: string
    data?: Record<string, unknown>
}

/* --- Register Generators --------------------------------------------------------------------- */

export default function (plop: PlopTypes.NodePlopAPI) {
    (async () => {
        try {

            // -- Register prompts --

            plop.setPrompt('autocomplete', autocomplete)

            // -- Register actions --

            plop.setActionType(
                'append-last-line', // @ts-ignore
                function (answers, config: AppendActionConfig, plop: PlopTypes.NodePlopAPI) {
                    const targetPath = plop.getPlopfilePath().replace('/turbo/generators', '')
                    const absolutePath = path.join(targetPath, config.path)
                    // Check if file exists, create it if it doesn't yet
                    if (fs.existsSync(absolutePath) === false) fs.writeFileSync(absolutePath, '')
                    // Append as last non-empty line
                    const existingContent = fs.readFileSync(absolutePath, 'utf8')
                    const existingLines = existingContent.split('\n').filter(Boolean)
                    const newContent = [...existingLines, config.template, ''].join('\n')
                    // Write to file
                    fs.writeFileSync(absolutePath, newContent)
                    // Tell turborepo where the change was made
                    return `/${config.path}`
                }
            )

            plop.setActionType(
                'add-package-script', // @ts-ignore
                function (answers, config: { packagePath: string, scriptName: string, scriptLine: string }, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log(`Adding "${config.scriptName}" script to package.json...`)
                            const { packagePath, scriptName, scriptLine } = config
                            const scriptPrefix = scriptName.includes(':') ? scriptName.split(':')[0] : ''
                            const packageJson = fs.readFileSync(packagePath, 'utf8')
                            const packageJsonLines = packageJson.split('\n')
                            const numSpaces = packageJsonLines[1].indexOf('"')
                            const packageData = JSON.parse(packageJson)
                            let strategy = !scriptPrefix ? 'append-last' : 'append-last-prefix'
                            let scriptLineIndex = 0
                            if (scriptPrefix) scriptLineIndex = packageJsonLines.findLastIndex((line) => line.includes(`"${scriptPrefix}:`))
                            if (scriptLineIndex <= 0) strategy = 'append-last'
                            if (strategy === 'append-last') {
                                packageData.scripts = { ...packageData.scripts, [scriptName]: scriptLine }
                                const newPackageJson = JSON.stringify(packageData, null, numSpaces)
                                fs.writeFileSync(packagePath, newPackageJson)
                            } else if (strategy === 'append-last-prefix') {
                                const spaces = ' '.repeat(numSpaces)
                                const newScriptLine = `${spaces.repeat(2)}"${scriptName}": "${scriptLine}",`
                                const newPackageJsonLines = [
                                    ...packageJsonLines.slice(0, scriptLineIndex + 1),
                                    newScriptLine,
                                    ...packageJsonLines.slice(scriptLineIndex + 1),
                                ]
                                const newPackageJson = newPackageJsonLines.join('\n')
                                fs.writeFileSync(packagePath, newPackageJson)
                            }
                            resolve(`Added "${config.scriptName}" script to package.json`)
                        } catch (error) {
                            console.error('Failed to add script to package.json:', error)
                            reject(error)
                        }
                    })
                }
            )

            plop.setActionType(
                'add-turbo-script', // @ts-ignore
                function (answers, config: { workspacePkg: string, scriptName: string, cache?: boolean }, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            const { workspacePkg, scriptName, cache = false } = config
                            const scriptKey = `${workspacePkg}#${scriptName}`
                            console.log(`Adding "${scriptKey}" script to turbo.json...`)
                            const turboJson = fs.readFileSync('turbo.json', 'utf8')
                            const turboJsonLines = turboJson.split('\n')
                            const numSpaces = turboJsonLines[1].indexOf('"')
                            const turboConfig = JSON.parse(turboJson)
                            const spaces = ' '.repeat(numSpaces)
                            const indent = spaces.repeat(2)
                            const pkgMatch = `${indent}"${workspacePkg}#`
                            const lastPkgScriptIndex = turboJsonLines.findLastIndex((line) => line.startsWith(pkgMatch))
                            const strategy = lastPkgScriptIndex > 0 ? 'append-last-pkg-script' : 'append-last'
                            if (strategy === 'append-last') {
                                const pipelineMatch = `${spaces}"pipeline": {`
                                const pipelineIndex = turboJsonLines.findIndex((line) => line.startsWith(pipelineMatch))
                                const prePipelineLines = turboJsonLines.slice(0, pipelineIndex + 1)
                                const restPipelineLines = turboJsonLines.slice(pipelineIndex + 1)
                                const endPipelineMatch = `${spaces}}`
                                const endPipelineIndex = restPipelineLines.findIndex((line) => line.startsWith(endPipelineMatch))
                                const pipelineLines = restPipelineLines.slice(0, endPipelineIndex)
                                const lastPipelineLine = pipelineLines[pipelineLines.length - 1]
                                const shouldAddComma = !lastPipelineLine.endsWith(',')
                                if (shouldAddComma) pipelineLines[pipelineLines.length - 1] = `${lastPipelineLine},`
                                const postPipelineLines = restPipelineLines.slice(endPipelineIndex)
                                const newScriptEntry = JSON.stringify({ [scriptKey]: { cache } }, null, numSpaces)
                                const newScriptLines = newScriptEntry.split('\n').slice(1, -1).map((line) => `${spaces}${line}`)
                                const newTurboJsonLines = [
                                    ...prePipelineLines,
                                    ...pipelineLines,
                                    ...newScriptLines,
                                    ...postPipelineLines,
                                ]
                                const newTurboJson = newTurboJsonLines.join('\n')
                                fs.writeFileSync('turbo.json', newTurboJson)
                            } else if (strategy === 'append-last-pkg-script') {
                                const finalPkgMatchEnd = `${indent}}`
                                const remainingTurboConfigLines = turboJsonLines.slice(lastPkgScriptIndex + 1)
                                const nextPkgScriptConfigEndIndex = remainingTurboConfigLines.findIndex((line) => line.includes(finalPkgMatchEnd))
                                const finalPkgScriptIndex = lastPkgScriptIndex + nextPkgScriptConfigEndIndex + 1 + 1
                                const newScriptLines = [
                                    `${spaces.repeat(2)}"${scriptKey}": {`,
                                    `${spaces.repeat(3)}"cache": ${JSON.stringify(cache)}`,
                                    `${spaces.repeat(2)}},`,
                                ]
                                const newTurboJsonLines = [
                                    ...turboJsonLines.slice(0, finalPkgScriptIndex),
                                    ...newScriptLines,
                                    ...turboJsonLines.slice(finalPkgScriptIndex),
                                ]
                                const newTurboJson = newTurboJsonLines.join('\n')
                                fs.writeFileSync('turbo.json', newTurboJson)
                            }
                            resolve(`Added "${scriptKey}" script to turbo.json`)
                        } catch (error) {
                            console.error('Failed to add script to package.json:', error)
                            reject(error)
                        }
                    })
                }
            )

            plop.setActionType(
                'open-files-in-vscode', // @ts-ignore
                function (answers, config: { paths: string[] }, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log('Opening files in VSCode...')
                            const targetPath = plop.getPlopfilePath().replace('/turbo/generators', '')
                            const absolutePaths = config.paths.map((p) => path.join(targetPath, p))
                            const numFiles = absolutePaths.length
                            const fileOrFiles = numFiles === 1 ? 'file' : 'files'
                            // Open files in VSCode
                            execSync(`code ${absolutePaths.join(' ')}`)
                            resolve(`Opened ${numFiles} ${fileOrFiles} in VSCode`)
                        } catch (error) {
                            // Fail silently
                            resolve('Skipped opening files in vscode')
                        }
                    })
                }
            )

            plop.setActionType(
                'collect-resolvers', // @ts-ignore
                function (answers, config, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log("Running 'collect:resolvers' script from '@green-stack/core' workspace...")
                            execSync(`npm -w @green-stack/core run collect:resolvers`)
                            resolve("Ran 'collect:resolvers' script from '@green-stack/core' workspace")
                        } catch (error) {
                            console.error(
                                "Failed to execute 'npm -w @green-stack/core run collect:resolvers':",
                                error
                            )
                            reject(error)
                        }
                    })
                }
            )

            plop.setActionType(
                'collect-generators', // @ts-ignore
                function (answers, config, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log("Running 'collect:generators' script from '@green-stack/core' workspace...")
                            execSync(`npm -w @green-stack/core run collect:generators`)
                            resolve("Ran 'collect:generators' script from '@green-stack/core' workspace")
                        } catch (error) {
                            console.error(
                                "Failed to execute 'npm -w @green-stack/core run collect-generators':",
                                error
                            )
                            reject(error)
                        }
                    })
                }
            )

            plop.setActionType(
                'link-routes', // @ts-ignore
                function (answers, config, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log("Running 'link-routes' script from '@green-stack/core' workspace...")
                            execSync(`npm -w @green-stack/core run link:routes`)
                            resolve("Ran 'link-routes' script from '@green-stack/core' workspace")
                        } catch (error) {
                            console.error("Failed to execute 'npm -w @green-stack/core run link:routes':", error)
                            reject(error)
                        }
                    })
                }
            )

            plop.setActionType(
                'build-schema', // @ts-ignore
                function (answers, config, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log("Running 'build:schema' script from '@green-stack/core' workspace...")
                            execSync(`npm -w @green-stack/core run build:schema`)
                            resolve("Ran 'build:schema' script from '@green-stack/core' workspace")
                        } catch (error) {
                            console.error("Failed to execute 'npm -w @green-stack/core run build:schema':", error)
                            reject(error)
                        }
                    })
                }
            )

            plop.setActionType(
                'install', // @ts-ignore
                function (answers, config, plop: PlopTypes.NodePlopAPI) {
                    return new Promise((resolve, reject) => {
                        try {
                            console.log("Running 'install' on monorepo root")
                            execSync(`npm install`)
                            resolve("Ran 'install' on monorepo root")
                        } catch (error) {
                            console.error("Failed to execute 'npm install':", error)
                            reject(error)
                        }
                    })
                }
            )

            // -- Register generators --

            Object.values(workspaceGenerators).forEach((registerGenerator) => {
                registerGenerator(plop)
            })

        } catch (error) {
            console.error('Failed to register generators:', error)
        }
    })()
}
