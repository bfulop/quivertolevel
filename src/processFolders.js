'use strict'

const { getNotebooks } = require('./getNotebooks')
const { processANotebook } = require('./processANotebook')

const processFolders = getNotebooks
  .map(xs => xs.map(a => processANotebook(a)))

module.exports = { processFolders }
