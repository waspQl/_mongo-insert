import mongodb from 'mongodb'
const MongoClient = mongodb.MongoClient

// 引数が渡ってきた場合はそれをport番号として使う
let port = 27017
if (
  process.argv[2]
  && Number.isInteger(
    parseInt(process.argv[2])
  )
) port = parseInt(process.argv[2])
// mongoへの接続確認用データベース
const dbname = 'admin'

MongoClient.connect('mongodb://127.0.0.1:' + port + '/' + dbname, (err, db) => {
  if (err === null) {
    console.log("Connected successfully to mongo server")
  } else {
    console.log("Connection failure to mongo server", err)
  }

  db.close()
})
