/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/no-anonymous-default-export */
import fs from 'fs'
import path from 'path'
import { PlopTypes } from '@turbo/gen'
import { execSync, spawn } from 'child_process'
import * as workspaceGenerators from '../../packages/@registries/generators.generated'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Learn more about Plop Generators at:
// -i- https://github.com/plopjs/plop

// -i- Plop runs sync and doesn't play well with CommonJS modules like custom inquirer prompts
// -i- Using createRequire for CJS inquirer-autocomplete-prompt to avoid issues with imports / ESM modules

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { default: autocomplete } = require('inquirer-autocomplete-prompt')

/* --- Types ----------------------------------------------------------------------------------- */

export type AppendActionConfig = PlopTypes.ActionConfig & {
    path: string
    template: string
    data?: Record<string, unknown>
}

/** --- detectIndent() ------------------------------------------------------------------------- */
/** -i- Detect indent size from existing JSON content. Returns 2 as default for new files. */
const detectIndent = (content: string): number => {
    const match = content.match(/^\s+/m)
    if (!match) return 4
    const spaces = match[0]
    if (spaces.includes('\t')) return 4 // JSON.stringify doesn't support tabs, use 4 as fallback
    return Math.max(2, spaces.length)
}

/** --- getProjectRoot() ----------------------------------------------------------------------- */
/** -i- Returns monorepo root. getPlopfilePath() returns the plopfile's directory (e.g. scripts/ or turbo/generators/) */
const getProjectRoot = (plop: PlopTypes.NodePlopAPI) => {
    const plopfileDir = plop.getPlopfilePath()
    return plopfileDir.includes('turbo' + path.sep + 'generators')
        ? path.join(plopfileDir, '..', '..')
        : path.dirname(plopfileDir)
}

/** --- getEditorCommand() --------------------------------------------------------------------- */
/** -i- Detects preferred editor: GEN_EDITOR → cursor/code/code-insiders → VISUAL → EDITOR */
const getEditorCommand = (): string | null => {
    if (process.env.GEN_EDITOR) return process.env.GEN_EDITOR
    for (const cmd of ['cursor', 'code', 'code-insiders']) {
        try {
            execSync(`which ${cmd}`, { stdio: 'ignore' })
            return cmd
        } catch {
            /* not found */
        }
    }
    if (process.env.VISUAL) return process.env.VISUAL
    if (process.env.EDITOR) return process.env.EDITOR
    return null
}

/* --- Register Generators --------------------------------------------------------------------- */

export default function (plop: PlopTypes.NodePlopAPI) {
    try {

        // -- Register prompts --

        plop.setPrompt('autocomplete', autocomplete)

        // -- Register actions --

        plop.setActionType(
            'append-last-line', // @ts-ignore
            function (answers, config: AppendActionConfig, plop: PlopTypes.NodePlopAPI) {
                const targetPath = getProjectRoot(plop)
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
                        let scriptLineIndex = 0 // @ts-ignore
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
            function (answers, config: {
                workspacePath: string,
                workspacePkg: string,
                scriptName: string,
                cache?: boolean,
                outputs?: string[],
                inputs?: string[],
            }, plop: PlopTypes.NodePlopAPI) {
                return new Promise((resolve, reject) => {
                    try {

                        const root = getProjectRoot(plop)
                        const { workspacePath, workspacePkg, scriptName, cache = false } = config
                        const scriptKey = `${scriptName}`
                        const turboPath = path.join(root, workspacePath, 'turbo.json')
                        console.log(`Adding "${scriptKey}" to ${workspacePath}/turbo.json...`)

                        const newTasksConfig = { [scriptKey]: { cache } }
                        let turboConfig: { extends?: string[], tasks?: Record<string, unknown> }
                        let indentSize = 4

                        if (fs.existsSync(turboPath)) {
                            const turboJson = fs.readFileSync(turboPath, 'utf8')
                            indentSize = detectIndent(turboJson)
                            turboConfig = JSON.parse(turboJson)
                            turboConfig.tasks = { ...(turboConfig.tasks ?? {}), ...newTasksConfig }
                        } else {
                            turboConfig = {
                                extends: ['//'],
                                tasks: newTasksConfig,
                            }
                        }

                        const newTurboJson = JSON.stringify(turboConfig, null, indentSize)
                        fs.writeFileSync(turboPath, newTurboJson)
                        resolve(`Added "${scriptKey}" to ${workspacePath}/turbo.json`)

                    } catch (error) {
                        console.error('Failed to add turbo script:', error)
                        reject(error)
                    }
                })
            }
        )

        const openFilesInEditorHandler = (
            _answers: unknown,
            config: { paths: string[] } | undefined,
            plop: PlopTypes.NodePlopAPI
        ) => {
            return new Promise<string>((resolve) => {
                if (!config?.paths?.length) return resolve('Skipped opening files (no paths)')
                if (process.env.GEN_OPEN !== '1') return resolve('Skipped opening files (use --open to open generated files)')
                try {
                    const editor = getEditorCommand()
                    if (!editor) return resolve('Skipped opening files (no editor found; set GEN_EDITOR or install code/cursor)')
                    const targetPath = getProjectRoot(plop)
                    const absolutePaths = config.paths.map((p) => path.join(targetPath, p))
                    const numFiles = absolutePaths.length
                    const fileOrFiles = numFiles === 1 ? 'file' : 'files'
                    console.log(`Opening ${numFiles} ${fileOrFiles} in ${editor}...`)
                    spawn(editor, absolutePaths, { stdio: 'ignore', detached: true })
                    resolve(`Opened ${numFiles} ${fileOrFiles} in ${editor}`)
                } catch {
                    resolve('Skipped opening files')
                }
            })
        }

        // @ts-ignore - handler signature compatible with CustomActionFunction (config may be undefined)
        plop.setActionType('open-files-in-editor', openFilesInEditorHandler as Parameters<PlopTypes.NodePlopAPI['setActionType']>[1])
        plop.setActionType('open-files-in-vscode', openFilesInEditorHandler as Parameters<PlopTypes.NodePlopAPI['setActionType']>[1])

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
}
