// @ts-ignore
import { v4 as uuidV4 } from 'uuid'
import { z } from '@green-stack/schemas'
import { warnOnce } from '@green-stack/utils/commonUtils'
import { getProperty } from '@green-stack/utils/objectUtils'
import { memoryDB } from '../constants/memoryDB.mock'
import { includesAny } from '@green-stack/utils/stringUtils'
import { arrFromSet } from '@green-stack/utils/arrayUtils'
import { LOGICAL_OPERATORS, QUERY_OPERATORS, QueryFilterType } from './createSchemaModel.types.ts'

/** --- createSchemaModel() -------------------------------------------------------------------- */
/** -i- Creates a schema model to interface with the mock memory DB */
export const createSchemaModel = <
    S extends z.ZodRawShape,
    DataType extends Prettify<z.input<z.ZodObject<S>>> = Prettify<z.input<z.ZodObject<S>>>, // prettier-ignore
    QueryFilter extends QueryFilterType<Partial<DataType>> = QueryFilterType<Partial<DataType>>, // prettier-ignore
>(
    schema: z.ZodObject<S>,
    modelName?: string,
) => {
    
    // Apply the schema name as the model key?
    const schemaMeta = schema.introspect()
    const modelKey = (modelName || schemaMeta.name) as string

    // Keep track of id fields used in find by ID operations
    const idFields = arrFromSet([...Object.keys(schemaMeta.schema!).filter(k => {
        const fieldMeta = schemaMeta.schema![k]
        return fieldMeta.isID || (fieldMeta.isUnique && fieldMeta.isIndex)
    })])

    // Keep track of created/modified dates?
    const createdAtField = Object.keys(schemaMeta.schema!).find(key => {
        if (!includesAny(key, ['created', 'inserted'])) return false
        return schemaMeta.schema![key].zodType === 'ZodDate'
    })
    const updatedAtField = Object.keys(schemaMeta.schema!).find(key => {
        if (!includesAny(key, ['updated', 'modified', 'edited'])) return false
        return schemaMeta.schema![key].zodType === 'ZodDate'
    })

    // Use softdeletes?
    const softDeleteField = Object.keys(schemaMeta.schema!).find(key => {
        if (!includesAny(key, ['deleted', 'removed'])) return false
        return schemaMeta.schema![key].zodType === 'ZodDate'
    })

    /** --- matchesCondition() ----------------------------------------------------------------- */
    /** -i- Checks whether mongo-like condition matching keys `$eq`, `$ne`, `$gt`, `$gte`, `$lt`, `$lte`, `$in`, `$nin` match the query */
    const matchesCondition = (value: DataType[keyof DataType], condition: QueryFilter[keyof QueryFilter]): boolean => {
        // Handle query operators
        const isValidCondition = typeof condition === 'object' && condition !== null
        if (isValidCondition) {
            return Object.entries(condition).every(([operator, operatorValue]) => {
                if (operator === '$eq') return value === operatorValue
                if (operator === '$ne') return value !== operatorValue
                if (operator === '$gt') return value > operatorValue
                if (operator === '$gte') return value >= operatorValue
                if (operator === '$lt') return value < operatorValue
                if (operator === '$lte') return value <= operatorValue
                if (operator === '$in') return operatorValue.includes(value)
                if (operator === '$nin') return !operatorValue.includes(value)
                throw new Error(`Unsupported condition operator in query: ${JSON.stringify(condition)}`)
            })
        }
        // Handle simple value comparison
        // @ts-ignore
        return value === condition
    }

    /** --- handleLogicalOperators() ----------------------------------------------------------- */
    /** -i- Checks whether mongo-like logical query keys `$and`, `$or`, `$nor` and `$not` match the query */
    const handleLogicalOperators = (record: DataType, operator: string, conditions: QueryFilter[]): boolean => {
        switch (operator) {
            case '$and':
                return conditions.every((condition: QueryFilter) => matchesQuery(record, condition))
            case '$or':
                return conditions.some((condition: QueryFilter) => matchesQuery(record, condition))
            case '$nor':
                return !conditions.some((condition: QueryFilter) => matchesQuery(record, condition))
            case '$not':
                return !matchesQuery(record, conditions as unknown as QueryFilter)
            default:
                throw new Error(`Unsupported logical operator "${operator}" in query`)
        }
    }

    /** --- matchesQuery() --------------------------------------------------------------------- */
    /** -i- Checks if a given record in the collection matches the query params */
    const matchesQuery = (record: DataType, query: QueryFilter): boolean => {
        return Object.entries(query).every(([key, value]) => {
            if (LOGICAL_OPERATORS.includes(key)) {
                return handleLogicalOperators(record, key, value as QueryFilter[])
            } else {
                const fieldValue = getProperty(record, key) as DataType[keyof DataType]
                const queryValue = value as QueryFilter[keyof QueryFilter]
                // Check if it's a nested query filter or a field operator
                const isNestedQuery = typeof queryValue === 'object' && queryValue !== null && !Array.isArray(queryValue)
                const isFieldOperator = isNestedQuery && Object.keys(queryValue).some((operator) => {
                    return QUERY_OPERATORS.includes(operator)
                })
                // Handle nested query filters
                if (isNestedQuery && !isFieldOperator) {
                    return matchesQuery(fieldValue as DataType, queryValue as QueryFilter)
                }
                // Handle field operators & simple value comparison
                return matchesCondition(fieldValue, queryValue)
            }
        })
    }

    /** --- insertOne() ------------------------------------------------------------------------ */
    /** -i- Create a new record in the collection */
    const insertOne = async (record: Partial<DataType>) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // Generate a new ID if one is not provided
            const id = record.id || uuidV4()
            const newRecord = { ...record, id }
            // Create a new model key if it does not exist (anymore)
            // Check that the record to insert is valid
            schema.parse(schema.applyDefaults(newRecord))
            // Check that the ID is unique
            if (memoryDB[modelKey] && memoryDB[modelKey][id]) {
                throw new Error(`Record with ID "${id}" already exists in model "${modelKey}"`)
            }
            // Insert the record into the memory DB
            memoryDB[modelKey][id] = newRecord
            // Return the inserted record
            return memoryDB[modelKey][id] as Prettify<DataType>
        } catch (error: any$FixMe) {
            throw new Error(`Failed to insert record into "${modelKey}" collection: ${error.message}`) // prettier-ignore
        }
    }

    /** --- insertMany() ----------------------------------------------------------------------- */
    /** -i- Create multiple records in the collection */
    const insertMany = async (records: Partial<DataType>[]) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // Generate new IDs for records that don't have them
            const newRecords = records.map((record) => {
                const id = record.id || uuidV4()
                return { ...record, id }
            })
            // Check that the records to insert are valid
            newRecords.forEach((record) => {
                schema.parse(schema.applyDefaults(record))
            })
            // Check that all IDs are unique
            newRecords.forEach((record) => {
                if (memoryDB[modelKey] && memoryDB[modelKey][record.id]) {
                    throw new Error(`Record with ID "${record.id}" already exists in model "${modelKey}"`) // prettier-ignore
                }
            })
            // Insert the records into the memory DB
            newRecords.forEach((record) => {
                memoryDB[modelKey][record.id] = record
            })
            // Return the inserted records
            return newRecords as Prettify<DataType>[]
        } catch (error: any$FixMe) {
            throw new Error(`Failed to insert records into "${modelKey}" collection: ${error.message}`) // prettier-ignore
        }
    }
    
    /** --- findOne() -------------------------------------------------------------------------- */
    /** -i- Finds a single record in the collection based on a query filter */
    const findOne = async (query: QueryFilter) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // Find the record in the memory DB
            const result = Object.values(memoryDB[modelKey]).find((record) => {
                return matchesQuery(record as DataType, query)
            })
            // Return the found record
            return result as DataType
        } catch (error: any$FixMe) {
            throw new Error(`Failed to find record in "${modelKey}" collection: ${error.message}`)
        }
    }

    /** --- findMany() -------------------------------------------------------------------------- */
    /** -i- Finds multiple records in the collection based on a query filter */
    const findMany = async (query: QueryFilter) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // Find the records in the memory DB
            const result = Object.values(memoryDB[modelKey]).filter((record) => {
                return matchesQuery(record as DataType, query)
            })
            // Return the found records
            return result as DataType[]
        } catch (error: any$FixMe) {
            throw new Error(`Failed to find records in "${modelKey}" collection: ${error.message}`)
        }
    }

    /** --- findOrCreate() --------------------------------------------------------------------- */
    /** -i- Finds an existing record or creates it with the provided data */
    const findOrCreate = async (query: QueryFilter, record: Partial<DataType>) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // Find the record to create
            const recordToCreate = await findOne(query) as DataType
            if (recordToCreate) {
                return recordToCreate
            } else {
                return insertOne(record)
            }
        } catch (error: any$FixMe) {
            throw new Error(`Failed to find or create record in "${modelKey}" collection: ${error.message}`)
        }
    }

    /** --- updateOne() ------------------------------------------------------------------------ */
    /** -i- Update a record in the collection */
    const updateOne = async (
        query: QueryFilter,
        fieldUpdates: Prettify<Partial<Omit<DataType, 'id'>>>,
        errorOnUnmatched = false,
    ) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        let recordId = ''
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // @ts-ignore
            if (updatedAtField) fieldUpdates[updatedAtField] = new Date()
            // Find the record to update
            const recordToUpdate = await findOne(query) as DataType
            if (!recordToUpdate && errorOnUnmatched) {
                throw new Error(`No record found to update in "${modelKey}" collection`)
            } else if (!recordToUpdate) {
                return recordToUpdate
            }
            // Merge the new record data with the existing record
            const updatedRecord = { ...recordToUpdate, ...fieldUpdates } as DataType
            // Check that we're not trying to update the ID
            if (recordToUpdate.id !== updatedRecord.id) {
                recordId = recordToUpdate.id as string
                throw new Error(`Cannot update a record's ID. Error while updating record with ID ${recordToUpdate.id} in "${modelKey}" collection`) // prettier-ignore
            }
            // Check that the updated record is valid
            schema.parse(schema.applyDefaults(updatedRecord))
            // Update the record in the memory DB
            memoryDB[modelKey][updatedRecord.id as string] = updatedRecord
            // Return the updated record
            return memoryDB[modelKey][updatedRecord.id as string] as DataType
        } catch (error: any$FixMe) {
            if (recordId) throw new Error(`Error while updating record with ID ${recordId} in "${modelKey}" collection: ${error.message}`) // prettier-ignore
            else throw new Error(`Failed to update record in "${modelKey}" collection: ${error.message}`) // prettier-ignore
        }
    }

    /** --- updateMany() ----------------------------------------------------------------------- */
    /** -i- Update multiple records in the collection */
    const updateMany = async (
        query: QueryFilter,
        fieldUpdates: Prettify<Partial<Omit<DataType, 'id'>>>,
        errorOnUnmatched = false,
    ) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // @ts-ignore
            if (updatedAtField) fieldUpdates[updatedAtField] = new Date()
            // Find the records to update
            const recordsToUpdate = await findMany(query)
            if (!recordsToUpdate.length && errorOnUnmatched) {
                throw new Error(`No records found to update in "${modelKey}" collection`)
            } else if (!recordsToUpdate.length) {
                return recordsToUpdate
            }
            // Update each record
            const updatedRecords = recordsToUpdate.map((record) => {
                const updatedRecord = { ...record, ...fieldUpdates } as DataType
                // Check that the updated record is valid
                schema.parse(schema.applyDefaults(updatedRecord))
                // Check that we're not trying to update the ID
                if (record.id !== updatedRecord.id) {
                    throw new Error(`Cannot update a record's ID. Error while updating record with ID ${record.id} in "${modelKey}" collection`) // prettier-ignore
                }
                // Update the record in the memory DB
                memoryDB[modelKey][updatedRecord.id as string] = updatedRecord
                return updatedRecord
            })
            // Return the updated records
            return updatedRecords
        } catch (error: any$FixMe) {
            throw new Error(`Failed to update records in "${modelKey}" collection: ${error.message}`)
        }
    }

    /** --- upsertOne() ------------------------------------------------------------------------ */
    /** -i- Updates or inserts a single record in the collection */
    const upsertOne = async (query: QueryFilter, record: Partial<DataType>) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // Find the record to update
            const recordToUpdate = await findOne(query) as DataType
            if (recordToUpdate) {
                // Update the record
                return updateOne(query, record as Prettify<Partial<Omit<DataType, 'id'>>>, true)
            } else {
                // Insert the record
                return insertOne(record)
            }
        } catch (error: any$FixMe) {
            throw new Error(`Failed to upsert record in "${modelKey}" collection: ${error.message}`)
        }
    }

    /** --- deleteOne() ------------------------------------------------------------------------ */
    /** -i- Removes a single record from the collection */
    const deleteOne = async (query: QueryFilter, errorOnUnmatched = false) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // Find the record to delete
            const recordToDelete = await findOne(query) as DataType
            if (!recordToDelete && errorOnUnmatched) {
                throw new Error(`No record found to delete in "${modelKey}" collection`)
            } else if (!recordToDelete) {
                return recordToDelete
            }
            // Hard delete the record?
            if (!softDeleteField) {
                // Delete the record from the memory DB
                delete memoryDB[modelKey][recordToDelete.id as string]
                // Return the deleted record
                return recordToDelete
            }
            // Soft delete the record instead
            // @ts-ignore
            return updateOne(query, { [softDeleteField]: new Date() }, true)
        } catch (error: any$FixMe) {
            throw new Error(`Failed to delete record from "${modelKey}" collection: ${error.message}`)
        }
    }

    /** --- deleteMany() ----------------------------------------------------------------------- */
    /** -i- Removes multiple records from the collection */
    const deleteMany = async (query: QueryFilter, errorOnUnmatched = false) => {
        memoryDB[modelKey] = memoryDB[modelKey] || {}
        try {
            // @ts-ignore
            if (softDeleteField) query[softDeleteField] = { $exists: false }
            // Find the records to delete
            const recordsToDelete = await findMany(query)
            if (!recordsToDelete.length && errorOnUnmatched) {
                throw new Error(`No records found to delete in "${modelKey}" collection`)
            } else if (!recordsToDelete.length) {
                return recordsToDelete
            }
            // Hard delete the records?
            if (!softDeleteField) {
                // Delete the records from the memory DB
                recordsToDelete.forEach((record) => {
                    delete memoryDB[modelKey][record.id as string]
                })
                // Return the deleted records
                return recordsToDelete
            }
            // Soft delete the records instead
            // @ts-ignore
            return updateMany(query, { [softDeleteField]: new Date() }, true)
        } catch (error: any$FixMe) {
            throw new Error(`Failed to delete records from "${modelKey}" collection: ${error.message}`)
        }
    }

    /* --- Return Driver Model ----------------------------------------------------------------- */

    const rawModel = {
        insert: insertOne,
        insertOne,
        insertMany,
        find: findMany,
        findOne,
        findMany,
        findOrCreate,
        update: updateOne,
        updateOne,
        updateMany,
        upsertOne,
        upsert: upsertOne,
        delete: deleteOne,
        deleteOne,
        deleteMany,
        // - Aliases -
        create: insertOne,
        createOne: insertOne,
        createMany: insertMany,
        read: findOne,
        readOne: findOne,
        readMany: findMany,
        modify: updateOne,
        modifyOne: updateOne,
        modifyMany: updateMany,
        remove: deleteOne,
        removeOne: deleteOne,
        removeMany: deleteMany,
    }

    const driver = {
        ...rawModel,
        // - Metadata -
        _key: modelKey,
        _raw: rawModel,
        _schema: schema,
        _data: undefined as unknown as DataType,
        _idFields: idFields,
        _createdAtField: createdAtField,
        _updatedAtField: updatedAtField,
        _softDeleteField: softDeleteField,
        _dbDriverType: 'mock' as const,
    }

    return Object.assign(driver, {
        driver,
    })
}
