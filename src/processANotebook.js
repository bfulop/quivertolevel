const fileUtils = require('./utils/fileUtils')
const processNote = require('./processNote')
const { task } = require('folktale/concurrency/task')

const noteBookData = ([meta, notesData]) =>
  Object.assign({}, { meta: meta }, { notesData: notesData })

const getNotebookMeta = npath =>
  fileUtils.readFile(`${npath}/meta.json`).map(JSON.parse)

const getNotesData = npath =>
  fileUtils
    .readDir(`${npath}`)
    .map(xs =>
      xs.filter(a => a != 'meta.json').map(a => processNote(`${npath}/${a}`))
    )

const processANotebook = npath =>
  getNotebookMeta(npath)
    .and(getNotesData(npath))
    .map(noteBookData)

module.exports = processANotebook
