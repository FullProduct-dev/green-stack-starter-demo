import { validateDbDriver } from '@db/driver/utils/validateDbDriver.db.ts'

/* --- Import Driver Methods ------------------------------------------------------------------- */

import { createSchemaModel } from '../utils/createSchemaModel.mock'
import { MockDBEntity } from '../schemas/MockEntity.schema.ts'

/* --- Driver Validation ----------------------------------------------------------------------- */

export const driver = validateDbDriver({
    createSchemaModel,
    DBEntity: MockDBEntity,
})
