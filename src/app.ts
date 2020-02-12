import {
  MongoClient,
  Db, // eslint-disable-line no-unused-vars
  //InsertWriteOpResult, // eslint-disable-line no-unused-vars
  BulkWriteResult // eslint-disable-line no-unused-vars
} from 'mongodb'
const assert = require('assert')

interface InsertOneWriteOpResult {
  result: { ok: number, n: number }
  ops: Array<any>
  insertedCount: number
  insertedId: any
}

interface InsertWriteOpResult {
  result: { ok: number, n: number }
  ops: Array<any>
  insertedCount: number
  insertedIds: object
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

let startTime: number
let endTime: number

// Connect using MongoClient
MongoClient.connect(url, async (err, db) => {
  if (err) throw err
  const dbo = db.db(dbName)

  let cnt = 0
  const obj = { a: 0 }
  updateStartTime()
  await insertOne(dbo, obj, (res) => {
    updateEndTime()
    // console.log(res.ops)
    assert.equal(1, res.insertedCount)
    consoleTime('insertOne Date', endTime - startTime)
  })
  cnt += 1

  const aryLength = 1000000
  const ary1 = Array.from(new Array(aryLength))
    .map((v, i) => i)
    .map(val => {
      return {b: val}
    })
  updateStartTime()
  await insertMany(dbo, ary1, (res) => {
    updateEndTime()
    // console.log(res.ops)
    assert.equal(aryLength, res.insertedCount)
    consoleTime('insertMany Date', endTime - startTime)
  })
  cnt += ary1.length

  const ary2 = Array.from(new Array(aryLength))
    .map((v, i) => i)
    .map(val => {
      return {c: val}
    })
  updateStartTime()
  await bulkInsert(dbo, ary2, (res) => {
    updateEndTime()
    // console.log(res.result.insertedIds)
    assert.equal(aryLength, res.nInserted)
    consoleTime('bulkInsert Date', endTime - startTime)
  })
  cnt += ary2.length

  updateStartTime()
  await find(dbo, async (res: Array<object>) => {
    updateEndTime()
    assert.equal(cnt, res.length)
    consoleTime('find Date', endTime - startTime)

    await drop(dbo, (res: boolean) => {
      assert.equal(true, res)
      db.close()
    })
  })
})

const updateStartTime = () => {
  startTime = Date.now()
}

const updateEndTime = () => {
  endTime = Date.now()
}

const consoleTime = (name: string, processingTime: number) => {
  const len = 16 - name.length

  console.log(
    name + (' '.repeat(len) + ':').slice(-1 * len),
    processingTime,
    'msec'
  )
}

const find = async (db: Db, callback: (msg: any) => void) => {
  return await db.collection(collectionName)
    .find({ })
    .toArray((err, res) => {
      if (err) throw err
      callback(res)
    })
}

const insertOne = async (db: Db, obj: object, callback: (msg: InsertOneWriteOpResult) => void) => {
  await db.collection(collectionName)
    .insertOne(obj)
    .then(res => {
      callback(res)
    })
    .catch(err => {
      throw err
    })
}

const insertMany = async (db: Db, ary: Array<any>, callback: (msg: InsertWriteOpResult) => void) => {
  await db.collection(collectionName)
    .insertMany(ary)
    .then(res => {
      callback(res)
    })
    .catch(err => {
      throw err
    })
}

const bulkInsert = async (db: Db, ary: Array<any>, callback: (msg: BulkWriteResult) => void) => {
  const bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  ary.forEach(obj => {
    bulk.insert(obj);
  })

  await bulk.execute((err, res) => {
    if (err) throw err
    callback(res)
  });
}

const drop = async (db: Db, callback: (msg: boolean) => void) => {
  await db.collection(collectionName)
    .drop(async (err, res) => {
      if (err) throw err
      callback(res)
    })
}
