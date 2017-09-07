const { processFolders } = require('./processFolders')
const { addNoteToMongo } = require('./addToMongo')
const { List } = require('immutable-ext')
const Task = require('data.task')

const upload = processFolders
  .map(List)
  .chain(xs => xs.traverse(Task.of, r => r.map(addNoteToMongo)))
  .chain(xs => xs.traverse(Task.of, fn => fn))
  .map(r => r.fold([]))

module.exports = { upload }
