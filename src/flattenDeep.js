const { List } = require('immutable-ext')
const Task = require('data.task')

const notesData = 'success1'

const Res = {
  meta: 'pants',
  notesData: [Task.of(notesData), Task.of(notesData)]
}

const unfoldNotesData = ndata => ndata
  .map(r => r.notesData.map(t => t.map(e => r.meta + e)))
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => fn.map(r => `${r}`)))

const deepStuff = Task.of([Task.of(Res), Task.of(Res)])
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => unfoldNotesData(fn)))
  .map(r => r.foldMap(List))
  .map(r => {
    console.log(insp(r))
    return r
  })
  .map(r => r.fold([]))

// Fork

module.exports = deepStuff
