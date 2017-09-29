const fileUtils = require('./utils/fileUtils')
const { processNote } = require('./processNote')
const Task = require('data.task')

const noteBookData = meta => notesData =>
  Object.assign({}, { meta: meta }, { notesData: notesData })

const getNotebookMeta = npath => 
  fileUtils
    .readFile(`${npath}/meta.json`)
    .map(JSON.parse)

const getNotesData = npath =>
  fileUtils
    .readDir(`${npath}`)
    .map(xs => xs
      .filter(a => a != 'meta.json')
      .map(a => processNote(`${npath}/${a}`))
    )

const processANotebook = npath =>
  Task.of(noteBookData)
  .ap(getNotebookMeta(npath))
  .ap(getNotesData(npath))

module.exports = { processANotebook }
