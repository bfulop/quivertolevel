// var MongoClient = require('mongodb').MongoClient
// var assert = require('assert')
// var f = require('util').format

const { processFolders } = require('./processFolders')
const { addNoteToMongo } = require('./addToMongo')
const { List } = require('immutable-ext')

const upload = processFolders
  .map(List)
  .map(t => t.fold([]))
  .map(xs => xs.map(r => addNoteToMongo(r)))

module.exports = { upload }
