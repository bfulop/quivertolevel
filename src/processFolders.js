'use strict'

const getNotebooks = require('./getNotebooks').getNotebooks
const processANotebook = require('./processANotebook').processANotebook

const processFolders = getNotebooks
  .map(xs => xs.map(a => processANotebook(a)))

console.log(insp(processFolders))

module.exports = { processFolders }
