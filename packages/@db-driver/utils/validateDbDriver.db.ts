import { DbDriverShape } from '../driver.signature'

/** --- validateDbDriver() --------------------------------------------------------------------- */
/** -i- Validates whether a DB driver matches the expected methods */
export const validateDbDriver = <DB_DRIVER extends DbDriverShape>(driver: DB_DRIVER) => {
    DbDriverShape.parse(driver)
    return driver as DB_DRIVER
}
