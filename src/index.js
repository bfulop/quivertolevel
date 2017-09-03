// var MongoClient = require('mongodb').MongoClient
// var assert = require('assert')
// var f = require('util').format

const {eitherToTask} = require('./utils/nt')


getConfig.fork(e => {
  console.log('error!!')
  return e
}, r => {
  console.log('done')
  console.log(r)
  return r
})


// // Use connect method to connect to the server
// MongoClient.connect(url, function (err, db) {
//   debugger
//   assert.equal(null, err)
//   console.log('Connected successfully to server')

//   db.close()
// })

module.exports = { getConfig }
