const fileUtils = require('./utils/fileUtils')
const { tryCatch } = require('./utils/either')
const { task } = require('folktale/concurrency/task')
// const { of } = require('folktale/data/task')

const getConfig = fileUtils
  .readFile('./config.json')
  .map(config => tryCatch(() => JSON.parse(config)))
  // .chain(e => 'error', r => r)

module.exports = { getConfig }
