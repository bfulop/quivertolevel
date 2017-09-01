var MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var f = require('util').format
const fileUtils = require('./fileUtils')
const { tryCatch } = require('./either')
const Task = require('data.task')

// convert an either to a task
const eitherToTask = e => e.fold(Task.rejected, Task.of)

const getConfig = fileUtils
  .readFile('../config.json')
  .map(config => tryCatch(() => JSON.parse(config)))
  .chain(eitherToTask)
  .map(c => c.mongodb)

console.log('getc', getConfig)

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
