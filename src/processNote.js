'use strict'

const fileUtils = require('./utils/fileUtils')
const Task = require('data.task')

const noteData = meta => content =>
  Object.assign({}, { meta: meta }, { content: content })

const getNoteMeta = npath =>
  fileUtils
      .readFile(`${npath}/meta.json`)
      .map(JSON.parse)

const getNoteContents = npath =>
  fileUtils
    .readFile(`${npath}/content.json`)
    .map(JSON.parse)

const processNote = npath => 
  Task.of(noteData)
  .ap(getNoteMeta(npath))
  .ap(getNoteContents(npath))

module.exports = { processNote }
