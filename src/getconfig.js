const R = require('ramda')
const { readFile } = require('./utils/fileUtils')
const { tryCatch } = require('./utils/either')
const { task } = require('folktale/concurrency/task')

const getConfig = () =>
  readFile('./config.json')
    .map(config => tryCatch(() => JSON.parse(config)))
    .map(r => r.fold(e => 'error', c => c))

const getConfigM = R.memoizeWith(r => 'config', getConfig)

module.exports = getConfigM
