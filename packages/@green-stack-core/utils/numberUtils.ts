// Native Utils
const { round, ceil, floor, random } = Math

/** --- randomInt() ---------------------------------------------------------------------------- */
/** -i- Generates a random integer between a max & min range */
export const randomInt = (max: number, min = 0) => {
    const minInt = ceil(min)
    const maxInt = floor(max)
    return floor(random() * (maxInt - minInt) + minInt)
}

/** --- roundTo() ------------------------------------------------------------------------------ */
/** -i- Uses scientific string notation to round numbers (up or down) to specific decimals
 ** Can pass a specific math rounding function as third arg like `ceil()` or `floor()` */
export const roundTo = (value: number | string, decimals = 0, roundFn: any = round) => {
    return +`${roundFn(`${value}e+${decimals}`)}e-${decimals}`
}

export const roundUpTo = (value: number | string, decimals = 0) => roundTo(value, decimals, ceil)
export const roundDownTo = (value: number | string, decimals = 0) => roundTo(value, decimals, floor)

/** --- hasLeadingZeroes() --------------------------------------------------------------------- */
/** -i- Detect leading zeroes in "numbers" */
export const hasLeadingZeroes = (numString: string | number): boolean => {
    return Number(numString).toString() !== numString
}

/** --- isValidNumber() ------------------------------------------------------------------------ */
/** -i- check if a string is a valid number, excluding leading zeroes
 ** Allowed: numbers & number strings like `"0"`, `"1"`, `"250"`, `"0.123"`
 ** Catches: non numbers & number string with leading zeroes like `"0568"`
 ** JavaScript ¯\_(ツ)_/¯ */
export const isValidNumber = (numCandidate: any): boolean => {
    if (typeof numCandidate === 'number') return true
    const isNonNumberFalsy = ![true, false, null].includes(numCandidate as unknown as boolean)
    const isNotArray = !Array.isArray(numCandidate)
    const isNotNaN = !Number.isNaN(+numCandidate)
    const doesntHaveLeadingZeroes = !hasLeadingZeroes(numCandidate)
    const canBeOperatedOn = isNonNumberFalsy && isNotArray && isNotNaN && doesntHaveLeadingZeroes
    return canBeOperatedOn && typeof +numCandidate === 'number'
}

/** --- parseIfValidNumber() ------------------------------------------------------------------- */
/** -i- checks if a variable can be parsed as a valid number, and then parses that number */
export const parseIfValidNumber = (numCandidate: any): number | undefined => {
    if (isValidNumber(numCandidate)) return +numCandidate
    return undefined
}
