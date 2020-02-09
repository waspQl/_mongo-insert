import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient
const assert = require('assert');

interface InsertOneWriteOpResult {
    insertedCount: number;
    ops: Array<any>;
    insertedId: any;
    connection: any;
    result: { ok: number, n: number }
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

  await insertOne(dbo, (res: InsertOneWriteOpResult) => {
    assert.equal(1, res.insertedCount)
  })

  await insertMany(dbo, (res: InsertOneWriteOpResult) => {
    assert.equal(2, res.insertedCount)
  })

  await drop(dbo, (res: boolean) => {
    assert.equal(true, res)
    db.close()
  })
})


const insertOne = async (db: mongodb.Db, callback: (msg: InsertOneWriteOpResult) => void) => {
  const obj = { a: '0' }

  await db.collection(collectionName)
    .insertOne(obj, (err: Error, res: InsertOneWriteOpResult) => {
      if (err) throw err
      callback(res)
    })
}

const insertMany = async (db: mongodb.Db, callback: (msg: any) => void) => {
  const ary = [
    { a: '1' },
    { a: '2' }
  ]

  await db.collection(collectionName)
    .insertMany(ary)
    .then(res => {
      callback(res)
    })
    .catch(err => {
      throw err
    })
}

const drop = async (db: mongodb.Db, callback: (msg: boolean) => void) => {
  await db.collection(collectionName)
    .drop(async (err, res) => {
      if (err) throw err
      callback(res)
    })
}
