const fileUtils = require('./utils/fileUtils')
const { tryCatch } = require('./utils/either')
const { task } = require('folktale/concurrency/task')

const getConfig = fileUtils
  .readFile('./config.json')
  .map(config => tryCatch(() => JSON.parse(config)))
  .map(r => r.fold(e => 'error', c => c))


  // .chain(e => 'error', r => r)

module.exports = { getConfig }
