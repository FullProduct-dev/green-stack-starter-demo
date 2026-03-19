// @ts-ignore
import { test, expect } from 'bun:test'
import { createSchemaModel } from './createSchemaModel.mock'
import { z, schema, type SchemaInfer } from '@green-stack/schemas/v3'

/** Prefix to isolate this test file's collections from z4/zm running in parallel */
const M = (name: string) => `z3_${name}`

/* --- Schemas --------------------------------------------------------------------------------- */

const UserSchema = schema('User', {
    id: z.string().uuid(),
    name: z.string(),
    email: z.string().email(),
    age: z.number().int().optional(),
    meta: schema('UserMeta', {
        version: z.number().int().optional(),
    }).optional(),
})

type UserSchema = SchemaInfer<typeof UserSchema>

/* --- Tests ----------------------------------------------------------------------------------- */

test('createSchemaModel() creates a new schema model in the memory DB', async () => {
    const UserModel = createSchemaModel(UserSchema)
    type UserModel = typeof UserModel.driver._data
    // Check that the UserModel is created with the correct methods
    expect(UserModel).toBeDefined()
    expect(UserModel.insertOne).toBeDefined()
    expect(UserModel.insertMany).toBeDefined()
    expect(UserModel.findOne).toBeDefined()
    expect(UserModel.findMany).toBeDefined()
    expect(UserModel.updateOne).toBeDefined()
    expect(UserModel.updateMany).toBeDefined()
    expect(UserModel.deleteOne).toBeDefined()
    expect(UserModel.deleteMany).toBeDefined()
    expect(UserModel.insertOne).toBeInstanceOf(Function)
    expect(UserModel.insertMany).toBeInstanceOf(Function)
    expect(UserModel.findOne).toBeInstanceOf(Function)
    expect(UserModel.findMany).toBeInstanceOf(Function)
    expect(UserModel.updateOne).toBeInstanceOf(Function)
    expect(UserModel.updateMany).toBeInstanceOf(Function)
    expect(UserModel.deleteOne).toBeInstanceOf(Function)
    expect(UserModel.deleteMany).toBeInstanceOf(Function)
})

test('createSchemaModel() creates a new schema model with DB driver methods attached', async () => {
    const UserModel = createSchemaModel(UserSchema)
    // Check that the UserModel has the correct methods attached
    expect(UserModel.driver).toBeDefined()
    expect(UserModel.driver.insertOne).toBeDefined()
    expect(UserModel.driver.insertMany).toBeDefined()
    expect(UserModel.driver.findOne).toBeDefined()
    expect(UserModel.driver.findMany).toBeDefined()
    expect(UserModel.driver.updateOne).toBeDefined()
    expect(UserModel.driver.updateMany).toBeDefined()
    expect(UserModel.driver.deleteOne).toBeDefined()
    expect(UserModel.driver.deleteMany).toBeDefined()
    expect(UserModel.driver.insertOne).toBeInstanceOf(Function)
    expect(UserModel.driver.insertMany).toBeInstanceOf(Function)
    expect(UserModel.driver.findOne).toBeInstanceOf(Function)
    expect(UserModel.driver.findMany).toBeInstanceOf(Function)
    expect(UserModel.driver.updateOne).toBeInstanceOf(Function)
    expect(UserModel.driver.updateMany).toBeInstanceOf(Function)
    expect(UserModel.driver.deleteOne).toBeInstanceOf(Function)
    expect(UserModel.driver.deleteMany).toBeInstanceOf(Function)
})

test('Model.driver.insertOne() inserts a new record in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserInsertOne1'))
    const newUser = await UserModel.driver.insertOne({
        name: 'Thorr',
        email: 'thorr@codinsonn.dev',
    })
    expect(newUser).toBeDefined()
    expect(newUser.id).toBeDefined()
    expect(newUser.name).toBe('Thorr')
    expect(newUser.email).toBe('thorr@codinsonn.dev')
})

test('Model.driver.insertOne() throws if inserted record does not match schema', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserInsertOne2'))
    // Check that we throw an error when inserting a record with invalid data
    await expect(UserModel.driver.insertOne({})).rejects.toThrow() // Missing required fields
    await expect(UserModel.driver.insertOne({ name: 'Thorr' })).rejects.toThrow() // Missing required field email
    await expect(UserModel.driver.insertOne({ name: 'Thorr', email: '' })).rejects.toThrow() // Missing email
    await expect(UserModel.driver.insertOne({ name: 'Thorr', email: 'thorr@codinsonn' })).rejects.toThrow() // Invalid email
})

test('Model.driver.insertMany() inserts multiple records in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserInsertMany1'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we can insert multiple records
    expect(newUsers).toBeDefined()
    expect(newUsers).toHaveLength(2)
    expect(newUsers[0].id).toBeDefined()
    expect(newUsers[0].name).toBe('Thorr')
    expect(newUsers[1].id).toBeDefined()
    expect(newUsers[1].name).toBe('Thorr')
    const newUsersResults = JSON.stringify(newUsers)
    expect(newUsersResults).toContain('thorr@codinsonn.dev')
    expect(newUsersResults).toContain('thorr@fullproduct.dev')
})

test('Model.driver.insertMany() throws if inserted records do not match schema', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserInsertMany2'))
    // Check that we throw an error when inserting records with invalid data
    await expect(UserModel.driver.insertMany([{}])).rejects.toThrow() // Missing required fields
    await expect(UserModel.driver.insertMany([{ name: 'Thorr' }])).rejects.toThrow() // Missing required field email
    await expect(UserModel.driver.insertMany([{ name: 'Thorr', email: '' }])).rejects.toThrow() // Missing email
    await expect(UserModel.driver.insertMany([{ name: 'Thorr', email: 'thorr@codinsonn' }])).rejects.toThrow() // Invalid email
})

test('Model.driver.findOne() finds a record stored in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserFindOne1'))
    const newUser = await UserModel.driver.insertOne({
        name: 'Thorr',
        email: 'thorr@codinsonn.dev',
    })
    // Check that we can find the record by id
    const foundById = await UserModel.driver.findOne({ id: newUser.id })
    expect(foundById).toBeDefined()
    expect(foundById.id).toBe(newUser.id)
    expect(foundById.name).toBe('Thorr')
    expect(foundById.email).toBe('thorr@codinsonn.dev')
    // Check that we can find the record by name
    const foundByName = await UserModel.driver.findOne({ name: 'Thorr' })
    expect(foundByName).toBeDefined()
    expect(foundByName.id).toBe(newUser.id)
    expect(foundByName.name).toBe('Thorr')
    expect(foundById.email).toBe('thorr@codinsonn.dev')
    // Check that we can find the record by email
    const foundByEmail = await UserModel.driver.findOne({ email: 'thorr@codinsonn.dev' })
    expect(foundByEmail).toBeDefined()
    expect(foundByEmail.id).toBe(newUser.id)
    expect(foundByEmail.name).toBe('Thorr')
    expect(foundById.email).toBe('thorr@codinsonn.dev')
    // Check that we return undefined when no record is found
    const notFound = await UserModel.driver.findOne({ id: '123' })
    expect(notFound).toBeUndefined()
})

test('Model.driver.findMany() finds multiple records stored in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserFindMany1'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we can find multiple records by name
    const foundByName = await UserModel.driver.findMany({ name: 'Thorr' })
    expect(foundByName).toBeDefined()
    expect(foundByName).toHaveLength(2)
    expect(foundByName[0].name).toBe('Thorr')
    expect(foundByName[1].name).toBe('Thorr')
    const foundByNameResults = JSON.stringify(foundByName)
    expect(foundByNameResults).toContain('thorr@codinsonn.dev')
    expect(foundByNameResults).toContain('thorr@fullproduct.dev')
})

test('Model.driver.updateOne() updates a record stored in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserUpdateOne1'))
    const newUser = await UserModel.driver.insertOne({
        name: 'Thorr',
        email: 'thorr@codinsonn.dev',
    })
    // Update the record
    const query = { id: newUser.id }
    const updatedUser = await UserModel.driver.updateOne(query, { email: 'thorr@fullproduct.dev' })
    expect(updatedUser).toBeDefined()
    expect(updatedUser.id).toBe(newUser.id)
    expect(updatedUser.name).toBe('Thorr')
    expect(updatedUser.email).toBe('thorr@fullproduct.dev')
})

test('Model.driver.updateOne() with errorOnUnmatched: true throws if updated record does not match schema', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserUpdateOne2'))
    const newUser = await UserModel.driver.insertOne({
        name: 'Thorr',
        email: 'thorr@codinsonn.dev',
    })
    // Check that we dont throw errors when calling .updateOne() valid data
    await expect(() => UserModel.driver.updateOne({ id: newUser.id }, {})).not.toThrow() // Should be fine
    await expect(() => UserModel.driver.updateOne({ id: newUser.id }, { name: 'Thor' })).not.toThrow() // Missing required field email
    // @ts-ignore
    await expect(() => UserModel.driver.updateOne({ id: newUser.id }, { id: 'should-be-immutable' }, true)).toThrow()
    // Check that we throw an error when updating a record with invalid data
    await expect(() => UserModel.driver.updateOne({ id: newUser.id }, { name: undefined }, true)).toThrow() // Not nullable or optional
    await expect(() => UserModel.driver.updateOne({ id: newUser.id }, { name: 'Thorr', email: '' }, true)).toThrow() // Missing email
    await expect(() => UserModel.driver.updateOne({ id: newUser.id }, { name: 'Thorr', email: 'thorr@codinsonn' }, true)).toThrow() // Invalid email
    // Check that we don't throw an error when updating a record that doesn't exist
    await expect(() => UserModel.driver.updateOne({ id: '' }, { name: 'Thorr' })).not.toThrow()
})

test('Model.driver.updateMany() updates multiple records stored in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserUpdateMany1'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we can update multiple records
    const query = { name: 'Thorr' }
    const updatedUsers = await UserModel.driver.updateMany(query, { name: 'Thor' })
    expect(updatedUsers).toBeDefined()
    expect(updatedUsers).toHaveLength(2)
    expect(updatedUsers[0].name).toBe('Thor')
    expect(updatedUsers[1].name).toBe('Thor')
})

test('Model.driver.updateMany() with errorOnUnmatched: true throws if updated records do not match schema', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserUpdateMany2'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we throw an error when updating records with invalid data
    await expect(() => UserModel.driver.updateMany({ name: 'Thorr' }, { name: undefined }, true)).toThrow() // Not nullable or optional
    await expect(() => UserModel.driver.updateMany({ name: 'Thorr' }, { name: 'Thorr', email: '' }, true)).toThrow() // Missing email
    // @ts-ignore
    await expect(() => UserModel.driver.updateMany({ name: 'Thorr' }, { id: 'should-be-immutable' }, true)).toThrow()
    // Check that we don't throw errors when calling .updateMany() with valid data
    await expect(() => UserModel.driver.updateMany({}, {})).not.toThrow() // Should be fine
    await expect(() => UserModel.driver.updateMany({ name: 'Thorr' }, { name: 'Thor' })).not.toThrow() // Should be fine
    // Check that we don't throw an error when updating records that don't exist
    await expect(() => UserModel.driver.updateMany({ email: '' }, { name: 'Thorr' })).not.toThrow()
})

test('Model.driver.upsertOne() inserts a new record if it does not exist', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserUpsertOne1'))
    // Check that we can insert a new record
    const newUser = await UserModel.driver.upsertOne({
        name: 'Thorr',
    }, {
        name: 'Thorr',
        email: 'thorr@codinsonn.dev',
    })
    // Check that the record was inserted
    expect(newUser).toBeDefined()
    expect(newUser.id).toBeDefined()
    expect(newUser.name).toBe('Thorr')
    expect(newUser.email).toBe('thorr@codinsonn.dev')
    // Check that we can find the record by id
    const foundById = await UserModel.driver.findOne({ id: newUser.id })
    expect(foundById).toBeDefined()
    expect(foundById.id).toBe(newUser.id)
    expect(foundById.name).toBe('Thorr')
    expect(foundById.email).toBe('thorr@codinsonn.dev')
})

test('Model.driver.upsertOne() updates an existing record if it exists', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserUpsertOne2'))
    const onlyUser = await UserModel.driver.insertOne({
        name: 'Thorr',
        email: 'thorr@codinsonn.dev',
    })
    // Check that we can update an existing record
    const updatedUser = await UserModel.driver.upsertOne({
        name: 'Thorr',
    }, {
        name: 'Thorr',
        email: 'thorr@fullproduct.dev',
    })
    // Check that the record was updated
    expect(updatedUser).toBeDefined()
    expect(updatedUser.id).toBe(onlyUser.id)
    expect(updatedUser.name).toBe('Thorr')
    expect(updatedUser.email).toBe('thorr@fullproduct.dev')
    // Check that we can find the record by id
    const foundById = await UserModel.driver.findOne({ id: onlyUser.id })
    expect(foundById).toBeDefined()
    expect(foundById.id).toBe(onlyUser.id)
    expect(foundById.name).toBe('Thorr')
    expect(foundById.email).toBe('thorr@fullproduct.dev')
    // Check that we can no longer find the record by the old email
    const notFoundByEmail = await UserModel.driver.findOne({ email: 'thorr@codinsonn.dev' })
    expect(notFoundByEmail).toBeUndefined()
})

test('Model.driver.deleteOne() deletes a record stored in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserDeleteOne1'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we return the deleted record
    const deletedUser = await UserModel.driver.deleteOne({ email: 'thorr@codinsonn.dev' })
    expect(deletedUser).toBeDefined()
    expect(deletedUser.id).toBeDefined()
    expect(deletedUser.name).toBe('Thorr')
    expect(deletedUser.email).toBe('thorr@codinsonn.dev')
    // Check that the record is no longer in the DB
    const foundByEmail = await UserModel.driver.findOne({ email: 'thorr@codinsonn.dev' })
    expect(foundByEmail).toBeUndefined()
    const foundMany = await UserModel.driver.findMany({ name: 'Thorr' })
    expect(foundMany).toBeDefined()
    expect(foundMany).toHaveLength(1)
    // Check that we don't throw an error when attempting to delete a record that doesn't exist
    await expect(() => UserModel.driver.deleteOne({ email: '' })).not.toThrow()
})

test('Model.driver.deleteMany() deletes multiple records stored in memory', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserDeleteMany1'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we return the deleted records
    const deletedUsers = await UserModel.driver.deleteMany({ name: 'Thorr' })
    expect(deletedUsers).toBeDefined()
    expect(deletedUsers).toHaveLength(2)
    expect(deletedUsers[0].name).toBe('Thorr')
    expect(deletedUsers[1].name).toBe('Thorr')
    // Check that the records are no longer in the DB
    const foundMany = await UserModel.driver.findMany({ name: 'Thorr' })
    expect(foundMany).toBeDefined()
    expect(foundMany).toHaveLength(0)
    // Check that we don't throw an error when attempting to delete records that don't exist
    await expect(() => UserModel.driver.deleteMany({ email: '' })).not.toThrow()
})

test('Model.driver.deleteMany() returns an empty array by default if no records are found', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserDeleteMany2'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we return an empty array when no records are found
    const deletedUsers = await UserModel.driver.deleteMany({ name: 'Thor' })
    expect(deletedUsers).toBeDefined()
    expect(deletedUsers).toHaveLength(0)
})

test('Model query filters support logical $and, $or, $nor & $not operators', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserQueryFilters1'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
        },
    ])
    // Check that we can use the $and operator
    const foundByAnd = await UserModel.driver.findMany({
        $and: [{ name: 'Thorr' }, { email: 'thorr@codinsonn.dev' }],
    })
    expect(foundByAnd).toBeDefined()
    expect(foundByAnd).toHaveLength(1)
    expect(foundByAnd[0].name).toBe('Thorr')
    expect(foundByAnd[0].email).toBe('thorr@codinsonn.dev')
    // Check that we can use the $or operator
    const foundByOr = await UserModel.driver.findMany({
        $or: [{ email: 'thorr@fullproduct.dev' }, { email: 'thorr@codinsonn.dev' }],
    })
    expect(foundByOr).toBeDefined()
    expect(foundByOr).toHaveLength(2)
    const foundByOrResults = JSON.stringify(foundByOr)
    expect(foundByOrResults).toContain('thorr@fullproduct.dev')
    expect(foundByOrResults).toContain('thorr@codinsonn.dev')
    // Check that we can use the $nor operator
    const foundByNor = await UserModel.driver.findMany({
        $nor: [{ email: 'thorr@fullproduct.dev' }, { name: '' }],
    })
    expect(foundByNor).toBeDefined()
    expect(foundByNor).toHaveLength(1)
    const foundByNorResults = JSON.stringify(foundByNor)
    expect(foundByNorResults).toContain('thorr@codinsonn.dev')
    // Check that we can use the $not operator
    const foundByNot = await UserModel.driver.findMany({
        $not: { name: 'Thorr' },
    })
    expect(foundByNot).toBeDefined()
    expect(foundByNot).toHaveLength(0)
})

test('Model query filters support conditional field operators $eq, $ne, $gt, $gte, $lt, $lte, $in, $nin', async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserQueryFilters2'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
            age: 30,
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
            age: 32,
        },
    ])
    // Check that we can use the $eq operator
    const foundByEq = await UserModel.driver.findMany({
        name: { $eq: 'Thorr' },
    })
    expect(foundByEq).toBeDefined()
    expect(foundByEq).toHaveLength(2)
    const foundByEqResults = JSON.stringify(foundByEq)
    expect(foundByEqResults).toContain('thorr@codinsonn.dev')
    expect(foundByEqResults).toContain('thorr@fullproduct.dev')
    // Check that we can use the $ne operator
    const foundByNe = await UserModel.driver.findMany({
        email: { $ne: 'thorr@codinsonn.dev' },
    })
    expect(foundByNe).toBeDefined()
    expect(foundByNe).toHaveLength(1)
    expect(foundByNe[0].email).toBe('thorr@fullproduct.dev')
    // Check that we can use the $gt operator
    const foundByGt = await UserModel.driver.findMany({
        age: { $gt: 30 },
    })
    expect(foundByGt).toBeDefined()
    expect(foundByGt).toHaveLength(1)
    expect(foundByGt[0].age).toBe(32)
    expect(foundByGt[0].email).toBe('thorr@fullproduct.dev')
    // Check that we can use the $gte operator
    const foundByGte = await UserModel.driver.findMany({
        age: { $gte: 32 },
    })
    expect(foundByGte).toBeDefined()
    expect(foundByGte).toHaveLength(1)
    expect(foundByGte[0].age).toBe(32)
    expect(foundByGte[0].email).toBe('thorr@fullproduct.dev')
    // Check that we can use the $lt operator
    const foundByLt = await UserModel.driver.findMany({
        age: { $lt: 32 },
    })
    expect(foundByLt).toBeDefined()
    expect(foundByLt).toHaveLength(1)
    expect(foundByLt[0].age).toBe(30)
    expect(foundByLt[0].email).toBe('thorr@codinsonn.dev')
    // Check that we can use the $lte operator
    const foundByLte = await UserModel.driver.findMany({
        age: { $lte: 30 },
    })
    expect(foundByLte).toBeDefined()
    expect(foundByLte).toHaveLength(1)
    expect(foundByLte[0].age).toBe(30)
    expect(foundByLte[0].email).toBe('thorr@codinsonn.dev')
    // Check that we can use the $in operator
    const foundByIn = await UserModel.driver.findMany({
        age: { $in: [30, 31, 32] },
    })
    expect(foundByIn).toBeDefined()
    expect(foundByIn).toHaveLength(2)
    const foundByInResults = JSON.stringify(foundByIn)
    expect(foundByInResults).toContain('thorr@codinsonn.dev')
    expect(foundByInResults).toContain('thorr@fullproduct.dev')
    // Check that we can use the $nin operator
    const foundByNin = await UserModel.driver.findMany({
        age: { $nin: [31] },
    })
    expect(foundByNin).toBeDefined()
    expect(foundByNin).toHaveLength(2)
    const foundByNinResults = JSON.stringify(foundByNin)
    expect(foundByNinResults).toContain('thorr@codinsonn.dev')
    expect(foundByNinResults).toContain('thorr@fullproduct.dev')
})

test("Model query filters support nested fields", async () => {
    const UserModel = createSchemaModel(UserSchema, M('UserQueryFilters3'))
    const newUsers = await UserModel.driver.insertMany([
        {
            name: 'Thorr',
            email: 'thorr@codinsonn.dev',
            meta: {
                version: 1,
            },
        },
        {
            name: 'Thorr',
            email: 'thorr@fullproduct.dev',
            meta: {
                version: 2,
            },
        },
    ])
    // Check that we can use nested fields in query filters
    const foundByNested = await UserModel.driver.findMany({
        meta: { version: 1 },
    })
    expect(foundByNested).toBeDefined()
    expect(foundByNested).toHaveLength(1)
    expect(foundByNested[0].email).toBe('thorr@codinsonn.dev')
})
