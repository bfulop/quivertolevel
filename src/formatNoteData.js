const { List } = require('immutable-ext')
const Task = require('data.task')

const unfoldNotesData = ndata => ndata
  .map(r => {
    console.log(insp(r))
    return r
  })
  .map(r => r.notesData.map(t => t.map(e => r.meta + e)))
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => fn.map(r => `${r}`)))
  .map(r => {
    console.log(insp(r))
    return r
  })
  .map(r => r.fold([]))

const deepStuff = stuff => List.of(stuff)
  .map(r => {
    console.log(insp(r))
    return r
  })
  // .map(r => List.of(r))
  .map(List)
  .map(xs => xs.traverse(Task.of, fn => {
    console.log(insp(xs))
    console.log(insp(fn))
    return unfoldNotesData(fn)
  }))
  // .map(r => r.foldMap(List))
  .map(r => {
    console.log(insp(r))
    return r
  })
  // .map(r => r.fold([]))

// Fork

module.exports = deepStuff
