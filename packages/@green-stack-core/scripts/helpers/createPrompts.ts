import { isKvRecord } from '../../utils/commonUtils'

/* --- Types ----------------------------------------------------------------------------------- */

export type PromptType = 'input' | 'number' | 'checkbox' | 'confirm' | 'list' | 'autocomplete'

export type PromptValue<
    TYPE extends PromptType,
    CHOICES extends readonly string[] = string[]
> = TYPE extends 'input'
    ? string
    : TYPE extends 'number'
    ? number
    : TYPE extends 'confirm'
    ? boolean
    : TYPE extends 'checkbox'
    ? CHOICES[number][]
    : TYPE extends 'list'
    ? CHOICES[number]
    : TYPE extends 'autocomplete'
    ? CHOICES[number]
    : never

export type CommonPrompt<TYPE extends PromptType> = {
    type: TYPE
    message: string
}

export type InputPrompt = CommonPrompt<'input'>
export type NumberPrompt = CommonPrompt<'number'>
export type ConfirmPrompt = CommonPrompt<'confirm'>

export type CheckboxPrompts<CHOICES extends readonly string[]> = CommonPrompt<'checkbox'> & {
    choices: CHOICES
}

export type ListPrompts<CHOICES extends readonly string[]> = CommonPrompt<'list'> & {
    choices: CHOICES
}

export type AutocompletePrompts<CHOICES extends readonly string[]> = CommonPrompt<'autocomplete'> & {
    choices: CHOICES
}

export type ExtractChoices<
    CHOICES extends readonly string[]
        | Record<string, string>
        | { name: string, value: string }[],
> = CHOICES extends readonly string[]
    ? CHOICES
    : CHOICES extends { name: string, value: string }[]
    ? CHOICES extends (infer U)[]
        ? U extends { name: string, value: infer V }
            ? V[]
            : string
        : string
    : CHOICES extends Record<string, string>
    ? ValuesOf<CHOICES>
    : string

export type BasePrompt<
    TYPE extends PromptType,
    CHOICES extends readonly string[]
        | Record<string, string>
        | { name: string, value: string }[]
        = string[]
> = TYPE extends 'input'
    ? InputPrompt
    : TYPE extends 'number'
    ? NumberPrompt
    : TYPE extends 'confirm'
    ? ConfirmPrompt
    : TYPE extends 'checkbox'
    ? CheckboxPrompts<ExtractChoices<CHOICES>>
    : TYPE extends 'list'
    ? ListPrompts<ExtractChoices<CHOICES>>
    : TYPE extends 'autocomplete'
    ? AutocompletePrompts<ExtractChoices<CHOICES>>
    : never

    export type PromptRefinement<
    NAME extends string,
    ANSWERS extends Record<string, any>,
    POSSIBLE_VALUES = ANSWERS[NAME],
> = {
    choices?: (data: ANSWERS) => readonly string[]
        | POSSIBLE_VALUES
        | { name: string, value: string }[]
        | { name: string, value: POSSIBLE_VALUES }[]
    default?: POSSIBLE_VALUES | ((data: ANSWERS) => POSSIBLE_VALUES)
    validate?: (input: POSSIBLE_VALUES) => boolean | string
    when?: (data: ANSWERS) => boolean
}

export type FullPrompt = {
    name: string
    type: PromptType
    message: string
    choices?: string[]
        | Record<string, string>
        | { name: string, value: string }[]
        | ((answers: any$Unknown) => string[]
            | { name: string, value: string }[]
        )
    source?: (answers: any$Unknown, input: string) => Promise<
        string[] | { name: string, value: string }[]
    >
    default?: any$Unknown
    validate?: (input: any$Unknown) => boolean | string
    when?: (data: any$Unknown) => boolean
}

/** --- toOptions() ---------------------------------------------------------------------------- */
/** -i- Turns a record of `{ label: value }` to `{ label: string, value: string }` */
export const toOptions = <T extends Record<string, string | number | boolean>>(
    options: T,
): { name: string; value: string }[] => {
    return Object.entries(options).map(([key, value]) => ({
        name: key,
        value: value.toString(),
    }))
}

/** --- createOptionLookup() ------------------------------------------------------------------- */
/** -i- Creates a list of options by specifiying 'name' and 'value' fields within a collection */
export const createOptionLookup = <T extends Record<K, any$Unknown>, K extends keyof T>(
    options: T[],
    nameKey: K,
    valueKey: K,
) => {
    return options.reduce(
        (options, current) => {
            // Skip if the item doesn't have a value for the name
            const name = current[nameKey]
            if (!name) return options
            // Skip if the item doesn't have a value for the key
            const value = current[valueKey]
            if (!value) return options 
            // Add the item to the options
            return [...options, { name, value }]
        },
        [] as Prettify<{ name: string; value: string }>[]
    )
}

/** --- createAutocompleteSource() ------------------------------------------------------------- */
/** -i- HoC that creates an autocomplete source fn that filters multi-choice cli options based on input */
export const createAutocompleteSource = (
    options: string[] | { name: string, value: string }[],
) => {
    return (answersSoFar: any$Todo, input = '') => {
        const filteredOptions = options.filter((option) => {
            let checkedString = option as string
            if (typeof option !== 'string') checkedString = `${option.name} ${option.value}`
            return checkedString.includes(input)
        })
        // console.log({ answersSoFar, filteredOptions })
        return Promise.resolve(filteredOptions)
    }
}

/** --- createPrompts() ------------------------------------------------------------------------ */
/** -i- Creates a list of prompt and provides typesafety for dynamic computed fields while doing so */
export const createPrompts = <
    PROMPTS extends Record<string, BasePrompt<any$Unknown, any$Unknown>>, // @ts-ignore
    VALUES = { [K in keyof PROMPTS]: PromptValue<PROMPTS[K]['type'], ExtractChoices<PROMPTS[K]['choices']>> }, // @ts-ignore
    POTENTIAL_REFINEMENTS = { [K in keyof VALUES]: PromptRefinement<K, VALUES> },
    REFINEMENTS extends Partial<POTENTIAL_REFINEMENTS> = Partial<POTENTIAL_REFINEMENTS>,
    PARSER extends (answers: VALUES) => any$Unknown = (answers: VALUES) => VALUES,
    PARSED = ReturnType<PARSER>,
>(
    prompts: PROMPTS,
    options?: {
        compute?: REFINEMENTS,
        parser?: PARSER,
    },
) => {

    // Extract options
    const { compute, parser } = options || {}

    // Transform the prompts to what Plop expects
    const fullPrompts = Object.entries(prompts).map(([key, prompt]) => {

        // Keep track of extras
        const extras = compute?.[key as keyof REFINEMENTS]
        const p = { name: key, ...prompt, ...extras } as Partial<FullPrompt>
        
        // Update choices?
        if (Array.isArray(p.choices)) {
            p.choices = p.choices.map((choice) => {
                if (typeof choice === 'string') return { name: choice, value: choice }
                return choice
            })
        } else if (isKvRecord(p.choices)) {
            p.choices = Object.entries(p.choices).map(([key, value]) => {
                return { name: key, value }
            })
        }

        // Create source for autocomplete?
        if (p.type === 'autocomplete' && p.choices) {
            // @ts-ignore
            p.source = createAutocompleteSource(p.choices)
            delete p.choices
        }

        // Bring it all together
        return p as Prettify<Partial<FullPrompt>>

    })

    return {
        prompts: fullPrompts,
        parseAnswers: (parser || ((answers: VALUES) => answers)) as PARSER,
        _values: null as VALUES,
        _refinements: null as POTENTIAL_REFINEMENTS,
        _parsed: null as PARSED,
    }
}
