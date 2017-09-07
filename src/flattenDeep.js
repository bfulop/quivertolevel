const { List } = require('immutable-ext')
const Task = require('data.task')

const notesData = 'success1'
const notesData2 = 'success2'
const notesData3 = 'success3'
const notesData4 = 'success4'

const Res = {
  meta: 'pants',
  notesData: [Task.of(notesData), Task.of(notesData2)]
}
const Res2 = {
  meta: 'pants',
  notesData: [Task.of(notesData3), Task.of(notesData4)]
}

const unfoldNotesData = ndata => ndata
  .map(r => r.notesData.map(t => t.map(e => r.meta + e)))
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => fn.map(r => `${r}`)))

const deepStuff = Task.of([Task.of(Res), Task.of(Res2)])
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => unfoldNotesData(fn)))
  .map(r => r.foldMap(List))
  .map(r => {
    console.log(insp(r[0]))
    console.log(insp(r[1]))
    console.log(insp(r))
    return r
  })
  .map(r => r.fold([]))

// Fork

module.exports = deepStuff
