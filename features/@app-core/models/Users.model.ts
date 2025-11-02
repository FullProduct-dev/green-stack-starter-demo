import { validateDriverModel } from '@db/driver'
import { User } from '../schemas/User.schema'
import { createSchemaModel } from '@db/driver'

/* --- Model ----------------------------------------------------------------------------------- */

export const Users = createSchemaModel(User)

/* --- Drivers --------------------------------------------------------------------------------- */

export const driverModel = validateDriverModel(Users.driver)
