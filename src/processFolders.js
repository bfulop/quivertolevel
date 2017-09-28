'use strict'

const { getNotebooks } = require('./getNotebooks')
const { processANotebook } = require('./processANotebook')
const { List } = require('immutable-ext')
const Task = require('data.task')

const processFolders = getNotebooks
  .map(xs => xs.map(a => processANotebook(a)))
  .map(List)
  .chain(xs => xs.traverse(Task.of, fn => fn))

module.exports = { processFolders }
