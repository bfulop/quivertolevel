// var MongoClient = require('mongodb').MongoClient
// var assert = require('assert')
// var f = require('util').format

const {eitherToTask} = require('./utils/nt')
const getConfig = require('./getConfig')

// const loadConfig = getConfig

getConfig.fork(e => {
  console.log('error!!')
  return e
}, r => {
  console.log('done')
  console.log(r)
  return r
})

// 1. get the config ✓
// 2. get the filepath from the config ✓
// 3. get the list of folders at the path ✓
// 3. process each folder
// 4. get the metadata file contents
// 5. get the subfolders
// ..
// x. send each one to mongodb


// // Use connect method to connect to the server
// MongoClient.connect(url, function (err, db) {
//   debugger
//   assert.equal(null, err)
//   console.log('Connected successfully to server')

//   db.close()
// })

module.exports = { getConfig }
