const getNotebooks = require('./getNotebooks')
const processANotebook = require('./processANotebook')
const { List } = require('immutable-ext')
const { of } = require('folktale/concurrency/task')

const processFolders = () =>
  getNotebooks()
    .map(xs => xs.map(a => processANotebook(a)))
    .map(List)
    .chain(xs => xs.traverse(of, fn => fn))

module.exports = processFolders
