const { processFolders } = require('./processFolders')
const { addNoteBookToDB } = require('./addToDB')
const { List } = require('immutable-ext')
const Task = require('data.task')
const formatNoteData = require('./formatNoteData')

const upload = processFolders
  .map(List)
  .chain(xs => xs.traverse(Task.of, formatNoteData))
  .chain(xs => xs.traverse(Task.of, addNoteBookToDB))
  .map(xs => xs.fold([]))

module.exports = { upload }
