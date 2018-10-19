const { processFolders } = require('./processFolders')
const { addNoteToDB } = require('./addToDB')
const { List } = require('immutable-ext')
const Task = require('data.task')
const flattenNoteBook = require('./flattenNoteBook')
const createKeys = require('./createKeys')

const mytask = createKeys.any
const upload = processFolders
  .chain(xs => xs.traverse(Task.of, flattenNoteBook))
  .map(r => r.fold())
  .map(xs => xs.map(r => createKeys.createkey(r)))
  .chain(xs => xs.traverse(Task.of, addNoteToDB))
  .map(xs => xs.fold([]))

module.exports = { upload }
