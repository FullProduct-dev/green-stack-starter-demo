type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> }

type DeepNullable<T> = { [P in keyof T]: DeepNullable<T[P]> | null }

type DeepNullish<T> = { [P in keyof T]?: DeepNullish<T[P]> | null }

type Overwrite<T, U> = Omit<T, keyof U> & U

type FlattenIfArray<T> = T extends (infer R)[] ? R : T

type Unpromisify<T> = T extends Promise<infer R> ? R : T

type ObjectType<T = unknown> = { [key: string]: T }

type ValuesOf<T> = T extends { [K in keyof T]: infer U } ? U[] : never;

type HintedKeys = string & {} // eslint-disable-line @typescript-eslint/ban-types

type Primitive = string | number | boolean | bigint | symbol | null | undefined

type NonNullableRequired<T> = T extends null | undefined ? never : T

type ExtractPrimitives<T> = {
  [K in keyof T]: NonNullableRequired<T[K]> extends Primitive ? { [P in K]: T[K] } : ExtractPrimitives<T[K]>
}[keyof NonNullableRequired<T>]

type DeepFlattenRequired<T> = {
  [K in keyof T]-?: NonNullableRequired<T[K]> extends Primitive ? NonNullableRequired<T[K]> : DeepFlattenRequired<NonNullableRequired<T[K]>>
}

type MergeUnion<T> = (T extends any ? (x: T) => void : never) extends (x: infer R) => void ? { [K in keyof R]: R[K] } : T

type ExtractRouteParams<T> = Partial<MergeUnion<ExtractPrimitives<DeepFlattenRequired<T>>>>

/** Makes nested types readable */
type Prettify<T> = {
  [K in keyof T]: T[K] extends Date
    ? T[K]
    : T[K] extends Object
        ? Prettify<T[K]>
        : T[K]
} & {}

type PrettifySingleKeyRecord<T> = T extends Record<infer K, infer V>
  ? K extends keyof T
    ? { [key in K]: V }
    : never
  : never

type LowercaseFirstChar<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? `${Lowercase<First>}${Rest}`
    : S

type UppercaseFirstChar<S extends string> =
  S extends `${infer First}${infer Rest}`
    ? `${Uppercase<First>}${Rest}`
    : S

/**
 * @example
 * ```ts
 * type anythingGoes = GenAnswers
 * //     ?^ any$Ignore
 * type partialAnswers = GenAnswers<SomeObject>
 * //     ?^ { a?: string; b?: string, c?: string }
 * type pickedAnswers = GenAnswers<SomeObject, 'a' | 'b'>
 * //     ?^ { a: string; b?: string }
 */
type GenAnswers<
    T extends Record<string, any> | undefined = undefined,
    PICKED extends keyof T = keyof T,
> = T extends undefined ? any$Ignore : Prettify<
    Partial<Pick<T, PICKED>> | Pick<T, PICKED>
>

type any$Todo = any
type any$Unknown = any
type any$Mock = any
type any$FixMe = any
type any$TooComplex = any
type any$Ignore = any
type any$Never = any
type any$Irrelevant = any
type any$RefinedLater = any
