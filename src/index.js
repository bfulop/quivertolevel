const { processFolders } = require('./processFolders')
const { addNoteToMongo } = require('./addToMongo')
const { List } = require('immutable-ext')
const Task = require('data.task')
const formatNoteData = require('./formatNoteData')

const upload = processFolders
  .map(List)
  .chain(xs => xs.traverse(Task.of, r => {
    console.log(insp(r))
    return formatNoteData(r)
  }))
  .map(r => {
    console.log(insp(r))
    return r
  })
  // .map(xs => xs.traverse(Task.of, fn => fn))
  .map(r => r.map(t => t.fold([])))
  .map(r => r.fold([]))
  .map(r => {
    console.log(insp(r))
    return r
  })

module.exports = { upload }
