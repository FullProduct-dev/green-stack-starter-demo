import { useFormState } from '@green-stack/forms/useFormState'
import { z, schema, inputOptions } from '@green-stack/schemas'

/* --- Disclaimer ------------------------------------------------------------------------------ */

// -i- This demo screen serves multiple purposes -i-

// -1- For how we calculated the efficiency gains with this kit -> See 'utils/calculateEfficiency.ts'
// -2- For a sense of how to use the form components and hooks -> See the rest of this file

// -i- Feel free to delete this and other example screens manually
// -i- or through a merge of the 'with/clean-slate' branch (paid version only)

/* --- Constants ------------------------------------------------------------------------------- */

export const oneDay = 8 // One day in work hours
export const oneWeek = oneDay * 5 // One work week in hours

export const annualWorkDays = 260 // Work days per year
export const annualWorkHours = annualWorkDays * oneDay // Work hours per year

export const FEATURES = inputOptions({
    'universal-starter': 'Write-once workflow for Web, iOS & Android',
    'git-plugins': 'Git based plugin branches & PRs',
    'stack-freedom': 'Choose my own Auth / DB / ... / plugins',
    'zod-query-toolkit': 'Auto typed API\'s + fetching (zod, react-query)',
    'generators-scripts': 'Scripts and Generators to skip boilerplate',
    'designed-for-copypaste': 'Portable structure for copy-paste features',
    'universal-fs-routing': 'Universal file based routing (Expo + Next.js)',
} as const)

export const IDENTITIES = inputOptions({
    'full-product-dev': 'Full-stack web or mobile dev',
    'freelance-app-dev': 'Freelance App Developer',
    'startup-founder': 'Startup Founder',
    'indiehacker': 'Indie Hacker / Solo App Dev',
    'studio-lead': 'Studio Lead / CEO / Architect',
} as const)

export const TECH_KNOWLEDGE = inputOptions({
    'git': 'Git',
    'javascript': 'Javascript',
    'typescript': 'Typescript',
    'react': 'React',
    'nodejs': 'Node.js',
    'nextjs': 'Next.js',
    'react-native': 'React Native',
    'expo': 'Expo',
    'zod': 'Zod',
    'react-query': 'Tanstack / react-query',
    'graphql': 'GraphQL',
} as const)

export const PLUGINS = inputOptions({
    'auth': 'Authentication - Clerk / ...',
    'db': 'Database - MongoDB / ...',
    // 'mail': 'Mail - Resend / Sendgrid / Mailgun / ...', // -i- Coming Soon
    // 'notifications': 'Notifications - OneSignal / Expo / ...', // -i- Coming Soon
    'payments': 'Payments - Stripe', //  ... / Polar / LemonSqueezy / RevenueCat / ...' // -i- Coming Soon
    // 'storage': 'Storage - UploadThing / Supabase / ...', // -i- Coming Soon
})

/* --- Props ----------------------------------------------------------------------------------- */

export const FormScreenProps = schema('FormScreenProps', {
    email: z.string().email().optional(),
    age: z.number().min(1).max(130).optional(),
    identifiesWith: IDENTITIES.optional(),
    excitingFeatures: z.array(FEATURES).default([]),
    pluginsToMerge: z.array(PLUGINS).default([]),
    feedbackSuggestions: z.string().optional(),
    platformsTargeted: z.number().optional(),
    // -- Form Settings --
    showFormState: z.boolean().default(false),
    showResults: z.boolean().default(false),
    showBenefits: z.boolean().default(true),
    // -- Precalculated --
    projectsPerYear: z.number().min(1).default(1),
    currentSetupHoursPerProject: z.number().default(oneWeek),
    knownTech: z.array(TECH_KNOWLEDGE).default(TECH_KNOWLEDGE.options),
    estHourlyPrice: z.number().min(20).max(1000).optional(),
})

export type FormScreenProps = z.input<typeof FormScreenProps>

/* --- Forms ----------------------------------------------------------------------------------- */

export type EfficiencyFormState = ReturnType<typeof useFormState<typeof FormScreenProps['shape']>>
