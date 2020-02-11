import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient
const assert = require('assert')
const { performance } = require('perf_hooks')

interface InsertOneWriteOpResult {
  result: { ok: number, n: number }
  ops: Array<any>
  insertedCount: number
  insertedId: any
}

interface BulkWriteResult {
  ok: number
  writeErrors: Array<any>
  writeConcernErrors: Array<any>
  insertedIds: Array<any>
  nInserted: number
  nUpserted: number
  nMatched: number
  nModified: number
  nRemoved: number
  upserted: Array<any>
}

// 引数が渡ってきた場合はそれをport番号として使う
let port = 27017
if (
  process.argv[2]
  && Number.isInteger(
    parseInt(process.argv[2])
  )
) port = parseInt(process.argv[2])
const url = 'mongodb://127.0.0.1:' + port + '/'

const dbName = 'testdb'
const collectionName = 'testCollection'

// Connect using MongoClient
MongoClient.connect(url, async (err, db) => {
  if (err) throw err
  const dbo = db.db(dbName)

  const obj = { a: '0' }
  let startTime = performance.now()
  await insertOne(dbo, obj, (res: InsertOneWriteOpResult) => {
    assert.equal(1, res.insertedCount)
  })
  let endTime = performance.now()
  console.log(
    'insertOne performance:',
    Math.floor(endTime - startTime),
    'msec'
  )

  const aryLength = 10000
  const ary = Array.from(new Array(aryLength))
    .map((v, i) => i)
    .map(val => {
      return {a: val}
    })
  startTime = performance.now()
  await insertMany(dbo, ary, (res: InsertOneWriteOpResult) => {
    assert.equal(aryLength, res.insertedCount)
  })
  endTime = performance.now()
  console.log(
    'insertMany performance:',
    Math.floor(endTime - startTime),
    'msec'
  )

  startTime = performance.now()
  await bulkInsert(dbo, ary, (res: BulkWriteResult) => {
    assert.equal(aryLength, res.nInserted)
  })
  endTime = performance.now()
  console.log(
    'bulkInsert performance:',
    Math.floor(endTime - startTime),
    'msec'
  )

  await drop(dbo, (res: boolean) => {
    assert.equal(true, res)
    db.close()
  })
})


const insertOne = async (db: mongodb.Db, obj: object, callback: (msg: InsertOneWriteOpResult) => void) => {
  await db.collection(collectionName)
    .insertOne(obj, (err: Error, res: InsertOneWriteOpResult) => {
      if (err) throw err
      callback(res)
    })
}

const insertMany = async (db: mongodb.Db, ary: Array<any>, callback: (msg: any) => void) => {
  await db.collection(collectionName)
    .insertMany(ary)
    .then(res => {
      callback(res)
    })
    .catch(err => {
      throw err
    })
}

const bulkInsert = async (db: mongodb.Db, ary: Array<any>, callback: (msg: any) => void) => {
  const bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  ary.forEach(obj => {
    bulk.insert(obj);
  })

  await bulk.execute((err, res) => {
    if (err) throw err
    callback(res)
  });
}

const drop = async (db: mongodb.Db, callback: (msg: boolean) => void) => {
  await db.collection(collectionName)
    .drop(async (err, res) => {
      if (err) throw err
      callback(res)
    })
}
