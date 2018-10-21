const { List, Map } = require('immutable-ext')
const { of } = require('folktale/concurrency/task')

const formatNoteData = folderDef =>
  List.of(folderDef.notesData)
    .chain(List)
    .traverse(of, fn => fn)
    .map(xs =>
      xs.map(r => Object.assign({ note: r }, { nbook: folderDef.meta }))
    )

module.exports = formatNoteData
