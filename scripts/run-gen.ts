#!/usr/bin/env npx tsx
import { spawn } from 'child_process'
import path from 'path'
import nodePlop from 'node-plop'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- Plop-based code generator CLI - replaces turbo gen.
// -i- Supports interactive mode and --args for non-interactive runs.

/* --- Usage ----------------------------------------------------------------------------------- */

// -i- npm run gen                              ->  interactive (pick generator, answer prompts)
// -i- npm run add:schema -- a1 a2 a3           ->  positional args (by order) (w/o --args)
// -i- npm run add:schema -- --args a1 _ a3     ->  positional args (by order) (with --args)          ->  _ to prompt for missing args
// -i- npm run add:schema -- --workspacePath pkg --schemaName=Foo --schemaDescription "desc"          ->  named args (w/o --args)
// -i- npm run add:schema -- --args --workspacePath pkg --schemaName Foo --schemaDescription "desc"   ->  named args (with --args)
// -i- npm run add:workspace -- --workspaceStructure schemas resolvers components                     ->  space-separated array answers (checkbox)

/* --- Constants ------------------------------------------------------------------------------- */

const PLOPFILE_PATH = path.join(process.cwd(), 'scripts/plopfile.cjs')

/* --- Types ----------------------------------------------------------------------------------- */

type PromptDef = { name?: string; type?: string }

/** --- toBypassValue() ------------------------------------------------------------------------ */
/** -i- Convert answer value to string format expected by plop's prompt bypass */
const toBypassValue = (value: unknown, promptType?: string): string => {
    if (value === undefined || value === null) return '_'
    if (Array.isArray(value)) return value.join(',')
    if (typeof value === 'boolean') return value ? 'y' : 'n'
    return String(value)
}

/** --- parseArgs() ---------------------------------------------------------------------------- */
/** -i- Maps node generator args to plop execution params if available */
const parseArgs = (): { generator?: string; args: string[]; isInteractive: boolean } => {

    // Slice args to know whether we're in interactive mode or not
    const argv = process.argv.slice(2)
    const argsIndex = argv.indexOf('--args')

    // If --args is present, run in explicit args mode. Generator before --args, args after.
    if (argsIndex !== -1) {
        const generator = argsIndex > 0 ? argv[0] : undefined
        const args = argv.slice(argsIndex + 1)
        return { generator, args, isInteractive: false }
    }
    
    // 0 args -> interactive (pick generator)
    if (argv.length === 0) return { args: [], isInteractive: true }
    // 1 arg  -> interactive for that generator (plop will run its prompts)
    if (argv.length === 1) return { generator: argv[0], args: [], isInteractive: true }
    // 2+ args -> non-interactive (generator + positional/named args, will still prompt for missing args)
    return { generator: argv[0], args: argv.slice(1), isInteractive: false }
}

/** --- parseNamedArgs() ----------------------------------------------------------------------- */
/** -i- Parses --key value and --key=value into Record<string, string[]>. Supports space-separated values for array prompts. */
const parseNamedArgs = (args: string[]): Record<string, string[]> => {
    const result: Record<string, string[]> = {}
    let i = 0
    while (i < args.length) {
        const arg = args[i]
        if (arg.startsWith('--')) {
            const keyValue = arg.slice(2)
            const eqIdx = keyValue.indexOf('=')
            if (eqIdx >= 0) {
                result[keyValue.slice(0, eqIdx)] = [keyValue.slice(eqIdx + 1)]
            } else {
                // Collect all values until the next --key
                const values: string[] = []
                i++
                while (i < args.length && !args[i].startsWith('--')) {
                    values.push(args[i])
                    i++
                }
                result[keyValue] = values
                continue
            }
        }
        i++
    }
    return result
}

/** --- mapArgsToAnswers() --------------------------------------------------------------------- */
/** -i- Maps positional or named args to plop answers using generator's prompt definitions */
const mapArgsToAnswers = (
    prompts: PromptDef[],
    args: string[],
    isNamed: boolean
): Record<string, unknown> => {

    // Map args to plop answers (positional by order, or named by --key value)
    const answers: Record<string, unknown> = {}
    const promptKeys = prompts.map((p) => p.name ?? '').filter(Boolean)

    // Checkbox/array: support comma-separated "a,b,c" and space-separated "a b c"
    const coerceValue = (key: string, value: string | string[]): unknown => {
        const prompt = prompts.find((p) => p.name === key)
        if (prompt?.type === 'checkbox') {
            const parts = Array.isArray(value)
                ? value.flatMap((v) => (v.includes(',') ? v.split(',').map((s) => s.trim()) : [v]))
                : value
                ? value.split(',').map((s) => s.trim())
                : []
            return parts.filter(Boolean)
        }
        return Array.isArray(value) ? (value.length ? value.join(' ') : '') : value
    }

    if (isNamed) {
        const named = parseNamedArgs(args)
        for (const key of promptKeys) {
            const value = named[key]
            if (value !== undefined) answers[key] = coerceValue(key, value)
        }
    } else {
        promptKeys.forEach((key, i) => {
            const value = args[i]
            if (value !== undefined) answers[key] = coerceValue(key, value)
        })
    }

    // Return mapped answers object to be used as plop generator input
    return answers
}

/** --- getGeneratorNames() -------------------------------------------------------------------- */
/** -i- Extract generator names from plop's registry for usage/error messages */
const getGeneratorNames = (plop: Awaited<ReturnType<typeof nodePlop>>): string[] => {
    return plop.getGeneratorList().map((g) => g.name)
}

/** --- printUsage() --------------------------------------------------------------------------- */
/** -i- Print the usage info for our generators */
const printUsage = (generatorNames: string[]): void => {
    console.error('Usage:')
    console.error('  run-gen <generator> --args <arg1> [arg2] ...          (positional)')
    console.error('  run-gen <generator> --args --key1 val1 --key2 val2    (named)')
    console.error('')
    console.error('Generators:', generatorNames.join(', '))
}

/** --- printGeneratorHelp() ------------------------------------------------------------------- */
/** -i- Print the help for a generator with the available prompt keys */
const printGeneratorHelp = (generatorName: string, promptKeys: string[]): void => {
    console.error(`Generator "${generatorName}" accepts these arguments (by name or position):`)
    console.error('  ' + promptKeys.map((k) => `--${k}`).join(' '))
}

/** --- runWithArgs() -------------------------------------------------------------------------- */
/** -i- Run a Plop generator by name, with arguments parsed & prefilled from command if provided */
const runWithArgs = async (generatorName: string, args: string[]): Promise<void> => {

    // Initialize plop with our plopfile and get the specified generator
    const plop = await nodePlop(PLOPFILE_PATH, {
        destBasePath: process.cwd(),
        force: false,
    })

    // Get the generator by name, throw error if not found
    const generator = plop.getGenerator(generatorName)
    if (!generator) {
        const generatorNames = getGeneratorNames(plop)
        throw new Error(`Generator "${generatorName}" not found. Available: ${generatorNames.join(', ')}`)
    }

    // Get the list of prompt keys from the generator's prompts
    const prompts = generator.prompts as PromptDef[]
    const promptKeys = prompts.map((p: PromptDef) => p.name ?? '').filter(Boolean)

    // If no args provided, show usage and exit with error
    if (args.length === 0) {
        printUsage(getGeneratorNames(plop))
        printGeneratorHelp(generatorName, promptKeys)
        process.exit(1)
    }

    // Map command line args to plop answers based on generator's expected prompts
    const isNamed = args[0]?.startsWith('--') ?? false
    const partialAnswers = mapArgsToAnswers(prompts, args, isNamed)

    // Check if we have answers for all prompts - if not, run prompts for the missing ones
    const allPromptsCovered = promptKeys.every((key) => partialAnswers[key] !== undefined)
    let answers = {} as Record<string, unknown>

    // All args provided - run actions directly
    if (allPromptsCovered) answers = partialAnswers
    
    // Missing some args - run plop prompts for the missing ones, pre-filling provided answers
    // Bypass array: use provided value or '_' to trigger prompt for missing
    if (!allPromptsCovered) {
        const bypassArr = promptKeys.map((key) => {
            const val = partialAnswers[key]
            const prompt = prompts.find((p: PromptDef) => p.name === key)
            return toBypassValue(val, prompt?.type)
        })
        answers = await generator.runPrompts(bypassArr)
    }

    // Run the generator with the mapped answers and handle results
    const result = await generator.runActions(answers)

    // If there are any failures, log them and exit with error code
    if (result.failures.length > 0) {
        console.error('Generator encountered errors:')
        result.failures.forEach((f) => console.error(f.error))
        process.exit(1)
    }

    // Log successful changes for visibility
    result.changes.forEach((c) => console.log(c.type, c.path))
}

/** --- runInteractive() ----------------------------------------------------------------------- */
/** -i- Run the interactive plop generator picker */
const runInteractive = (): void => {

    // For interactive mode, we simply spawn the plop CLI with our plopfile and inherit stdio for user interaction
    const plopArgs = [
        '--plopfile',
        PLOPFILE_PATH,
        '--dest',
        process.cwd(),
        ...process.argv.slice(2).filter((a) => a !== '--'),
    ]

    // Spawn plop CLI as a child process, inheriting stdio for interactive prompts
    const child = spawn('npx', ['plop', ...plopArgs], {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: process.env,
    })

    // Handle child process exit and propagate exit code
    child.on('exit', (code) => process.exit(code ?? 0))
}

/* --- Execution ------------------------------------------------------------------------------- */

const main = async () => {

    // Parse command line arguments to determine generator and mode (interactive vs non-interactive)
    const { generator, args, isInteractive } = parseArgs()

    // If in interactive mode, run the plop CLI interface; otherwise, run the specified generator with args
    if (isInteractive) return runInteractive()

    // If no generator specified in non-interactive mode, show usage and exit with error
    if (!generator) {
        const plop = await nodePlop(PLOPFILE_PATH, { destBasePath: process.cwd(), force: false })
        printUsage(getGeneratorNames(plop))
        process.exit(1)
    }

    // Run specified generator with the provided arguments and handle any errors
    try {
        await runWithArgs(generator, args)
    } catch (err) {
        console.error(err instanceof Error ? err.message : err)
        process.exit(1)
    }
}

main()
