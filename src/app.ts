import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient
const assert = require('assert');

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
  const collection = dbo.collection(collectionName)

  const obj = { a: '0' }
  const ary = [
    { a: '1' },
    { a: '2' }
  ]

  await collection.insertOne(obj, (err, res) => {
    if (err) throw err
    assert.equal(1, res.insertedCount)
    return
  })

  await collection.insertMany(ary)
    .then(res => {
      assert.equal(ary.length, res.insertedCount)
    })
    .catch(err => {
      throw err
    })

  await collection.drop(async (err, res) => {
    if (err) throw err
    assert.equal(true, res)

    db.close()
  })
})
