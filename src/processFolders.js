'use strict'

const { List, Map } = require('immutable-ext')
const Task = require('data.task')
const getNotebooks = require('./getNotebooks').getNotebooks
const processANotebook = require('./processANotebook').processANotebook

const processFolders = getNotebooks
  .map(List)
  .chain(xf => xf.traverse(Task.of, processANotebook))
  .map(t => t.fold([]))
  // .fold([])

  // files.traverse(Task.of, fn => readFile(fn, 'utf-8'))

module.exports = { processFolders }
