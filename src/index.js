const { processFolders } = require('./processFolders')
const { addNoteToMongo } = require('./addToMongo')
const { List } = require('immutable-ext')
const Task = require('data.task')
const formatNoteData = require('./formatNoteData')

const upload = processFolders
  .map(List)
  .chain(xs => xs.traverse(Task.of, formatNoteData))
  .map(xs => xs.fold())
  .chain(xs => xs.traverse(Task.of, addNoteToMongo))
  .map(xs => xs.fold([]))

module.exports = { upload }
