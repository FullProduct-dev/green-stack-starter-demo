import { dbDrivers } from '@app/registries/drivers/db.drivers.generated'
import { appConfig } from '@app/config'

/* --- Determine Main DB driver ---------------------------------------------------------------- */

const dbDriver = dbDrivers[appConfig.drivers.db]
if (!dbDriver) throw new Error(
    `No DB driver found for key "${appConfig.drivers.db}". ` +
    `Make sure the driver is installed and the driver key is correct.`,
)

/* --- Re-export Driver Resources -------------------------------------------------------------- */

export const createSchemaModel = dbDriver['createSchemaModel']
export const DBEntity = dbDriver['DBEntity']

/* --- Export Driver Helpers ------------------------------------------------------------------- */

export { validateDbDriver } from './utils/validateDbDriver.db.ts'
export { validateDriverModel } from './utils/validateDriverModel.db.ts'
