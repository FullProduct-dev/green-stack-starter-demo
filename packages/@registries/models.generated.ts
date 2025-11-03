// -i- Auto generated with "npx turbo run @db/driver#collect-models"
import { driverModel as Users } from '@app/core/models/Users.model.ts'
import { driverModel as Settings } from '@app/core/models/Settings.model.ts'

/* --- Reexports ------------------------------------------------------------------------------- */

export {
    Users,
    Settings
}

/* --- Models ---------------------------------------------------------------------------------- */

const dbModels = {
    Users,
    Settings
}

/* --- Exports --------------------------------------------------------------------------------- */

export type DB_MODEL = keyof typeof dbModels

export default dbModels
