const { List, Map } = require('immutable-ext')
const Task = require('data.task')

const formatNoteData = folderDef => 
  List.of(folderDef.notesData)
  .chain(List)
  .traverse(Task.of, fn => fn)
  .map(xs => xs.map(r => Object.assign({note: r}, {nbook: folderDef.meta})))

module.exports = formatNoteData
