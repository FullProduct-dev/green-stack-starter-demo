
/* --- Case Utils ------------------------------------------------------------------------------ */
export const snakeToCamel = (str: string) => str.replace(/(_\w)/g, (m) => m[1].toUpperCase())
export const snakeToDash = (str: string) => str.replace(/_/g, '-')
export const dashToCamel = (str: string) => str.replace(/(-\w)/g, (m) => m[1].toUpperCase())
export const dashToSnake = (str: string) => str.replace(/-/g, '_')
export const camelToSnake = (str: string) => str.replace(/[\w]([A-Z])/g, (m) => `${m[0]}_${m[1]}`).toLowerCase() // prettier-ignore
export const camelToDash = (str: string) => str.replace(/[\w]([A-Z])/g, (m) => `${m[0]}-${m[1]}`).toLowerCase() // prettier-ignore

/** --- uppercaseFirstChar() ------------------------------------------------------------------- */
/** -i- Uppercase the first character of a string */
export const uppercaseFirstChar = (str: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str // prettier-ignore

/** --- lowercaseFirstChar() ------------------------------------------------------------------- */
/** -i- Lowercase the first character of a string */
export const lowercaseFirstChar = (str: string) => str ? str.charAt(0).toLowerCase() + str.slice(1) : str // prettier-ignore

/** --- replaceStringVars() -------------------------------------------------------------------- */
/** -i- Replaces placeholders like {somevar} or [somevar] with values from injectables */
export const replaceStringVars = (
  stringWithPlaceholders: string,
  injectables: Record<string, string | number>
) => {
    let result = stringWithPlaceholders
    Object.keys(injectables).forEach((key) => {
        result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), injectables[key].toString()) // prettier-ignore
        result = result.replace(new RegExp(`\\[${key}\\]`, 'g'), injectables[key].toString()) // prettier-ignore
    })
    return result
}

/** --- findTargetString() --------------------------------------------------------------------- */
/** -i- Finds a $target$ string inside another string
 * @example ```
 *    const folderWithIcons = findTargetString(
 *      'some/path/to/specific-folder/icons/',
 *      'some/path/to/$target$/icons/'
 *    ) // => 'specific-folder'
 * ``` */
export const findTargetString = (source: string, search = '($target$)') => {
    const [preTarget, postTarget] = search.split('$target$')
    const parts = source.split(preTarget)
    const target = parts.pop()?.split(postTarget)?.[0]
    return target
}

/** --- replaceMany() -------------------------------------------------------------------------- */
/** -i- Replaces every string you pass as the targets (2nd arg) with the string in the 3rd argument
 * @example ```
 *    replaceMany('useUpdateDataForm()', ['Update', 'Add'], '')
 *    // => 'useDataForm()' -- Removed 'Update'
 *    replaceMany('useAddUserForm()', ['Update', 'Add'], '')
 *    // => 'useUserForm()' -- Removed 'Add'
 * ``` */
export const replaceMany = (source: string, targets: string[], replacement: string) => {
    const allTargets = targets.flatMap((target) => [uppercaseFirstChar(target), lowercaseFirstChar(target)]) // prettier-ignore
    let result = source
    allTargets.forEach((searchStr) => {
        result = result.replace(new RegExp(searchStr, 'g'), replacement)
    })
    return result
}

/** --- includesAny() -------------------------------------------------------------------------- */
/** -i- Checks whether a given string includes any of the provided words (lowercased matching) */
export const includesAny = (source: string, words: string[]) => {
    const lowercasedSource = source.toLowerCase()
    const lowercasedWords = words.map((word) => word.toLowerCase())
    return lowercasedWords.some((word) => lowercasedSource.includes(word))
}

/** --- slugify() ------------------------------------------------------------------------------ */
/** -i- Converts a string to a slug */
export const slugify = (str: string) => {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
}

/** --- extractPathParams() -------------------------------------------------------------------- */
/** -i- Extracts an array of potential params from a url, e.g. `'/api/user/[slug]/...' => ['slug']` */
export const extractPathParams = (url: string) => {
    const pathSegments = url.split('/')
    const pathParams = pathSegments.filter((segment) => segment.startsWith('[') && segment.endsWith(']'))
    return pathParams.map((param) => param.slice(1, -1))
}

/** --- ansi ----------------------------------------------------------------------------------- */
/** -i- Ansi constants for escape codes */
export const ansi = {
    // Utility
    reset: "\x1b[0m",
    bold: "\x1b[1m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    muted: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",
    
    // Colors
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    magenta: "\x1b[35m",
    cyan: "\x1b[36m",
    white: "\x1b[37m",

    // Backgrounds
    bgBlack: "\x1b[40m",
    bgRed: "\x1b[41m",
    bgGreen: "\x1b[42m",
    bgYellow: "\x1b[43m",
    bgBlue: "\x1b[44m",
    bgMagenta: "\x1b[45m",
    bgCyan: "\x1b[46m",
    bgWhite: "\x1b[47m"
} as const

/** --- ansi utils ----------------------------------------------------------------------------- */
/** -i- Ansi helpers functions to format logs and terminal messages */
export const a = {
    // Utility
    bold: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bold}${msg}${ansi.reset}`,
    muted: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.dim}${msg}${ansi.reset}`,
    underscore: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.underscore}${msg}${ansi.reset}`,
    blink: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.blink}${msg}${ansi.reset}`,
    reverse: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.reverse}${msg}${ansi.reset}`,
    hidden: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.hidden}${msg}${ansi.reset}`,
    reset: <MSG extends string>(msg: MSG) => `${ansi.reset}${msg}${ansi.reset}`,
    dim: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.dim}${msg}${ansi.reset}`,
    italic: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.dim}${msg}${ansi.reset}`,

    // Colors
    black: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.black}${msg}${ansi.reset}`,
    red: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.red}${msg}${ansi.reset}`,
    green: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.green}${msg}${ansi.reset}`,
    yellow: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.yellow}${msg}${ansi.reset}`,
    blue: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.blue}${msg}${ansi.reset}`,
    magenta: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.magenta}${msg}${ansi.reset}`,
    cyan: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.cyan}${msg}${ansi.reset}`,
    white: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.white}${msg}${ansi.reset}`,
    
    // Backgrounds
    bgBlack: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgBlack}${msg}${ansi.reset}`,
    bgRed: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgRed}${msg}${ansi.reset}`,
    bgGreen: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgGreen}${msg}${ansi.reset}`,
    bgYellow: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgYellow}${msg}${ansi.reset}`,
    bgBlue: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgBlue}${msg}${ansi.reset}`,
    bgMagenta: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgMagenta}${msg}${ansi.reset}`,
    bgCyan: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgCyan}${msg}${ansi.reset}`,
    bgWhite: <MSG extends string>(msg: MSG, clear = false) => `${clear ? ansi.reset : ''}${ansi.bgWhite}${msg}${ansi.reset}`,
} as const
