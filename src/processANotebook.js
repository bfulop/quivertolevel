const R = require('ramda')
const fileUtils = require('./utils/fileUtils')
const processNote = require('./processNote')
const { task } = require('folktale/concurrency/task')
const getConfig = require('./getconfig')

function logger(r) {
  console.log('src/processANotebook.js')
  console.log(r)
  return r
}


function doReplacements([meta, replacementsXs]) {
  // logger(replacementsXs)
  function replaceFromList(text) {
    R.forEach(r => {text = R.replace(r.from, r.to, text)}, replacementsXs)
    logger(text)
    return text
  }
  return R.over(R.lensProp('name'), replaceFromList, meta)
}

const noteBookData = ([meta, notesData]) =>
  Object.assign({}, { meta: meta }, { notesData: notesData })

const getNotebookMeta = npath =>
  fileUtils.readFile(`${npath}/meta.json`)
    .map(JSON.parse)
    .and(getConfig().map(R.prop('titlereplacements')))
    .map(doReplacements)

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
