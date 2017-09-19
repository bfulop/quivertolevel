const { List } = require('immutable-ext')
const Task = require('data.task')

const unfoldNotesData = ndata => ndata
  .map(r => r.notesData.map(t => t.map(e => r.meta + e)))
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => fn.map(r => `${r}`)))
  .map(r => r.fold([]))

const deepStuff = stuff => List.of(stuff)
  .map(List)
  .map(xs => xs.traverse(Task.of, fn => unfoldNotesData(fn)))

module.exports = deepStuff
