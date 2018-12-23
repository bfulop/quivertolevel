const fileUtils = require('./utils/fileUtils')
const { task } = require('folktale/concurrency/task')
const { addTags } = require('./addTags')

const noteData = ([meta, content]) =>
  Object.assign({}, { meta: meta }, { content: content })

const getNoteMeta = npath =>
  fileUtils.readFile(`${npath}/meta.json`).map(JSON.parse)

const getNoteContents = npath =>
  fileUtils.readFile(`${npath}/content.json`).map(JSON.parse)

const processNote = npath =>
  getNoteMeta(npath)
    .and(getNoteContents(npath))
    .map(noteData)
    .chain(addTags)

module.exports = processNote
