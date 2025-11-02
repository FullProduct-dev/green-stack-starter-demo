import { z, schema } from '@green-stack/schemas'
import { partials } from '@app/registries/schemas.partials'

/* --- Description ----------------------------------------------------------------------------- */

const d = "Essential user info"

/** --- User ----------------------------------------------------------------------------------- */
/** -i- Essential user info */
export const User = schema('User', {

    userId: z
        .string()
        .index()
        .unique()
        .describe('Auth provider sub or user ID'),
    email: z
        .string()
        .unique()
        .describe('Primary Github email used during OAuth'),

    // -i- Partial fields from other modules / features / packages / plugins

    ...partials.User,

}).describe(d)

/* --- Type Alias ------------------------------------------------------------------------------ */

export type User = z.input<typeof User>
