const fileUtils = require('./utils/fileUtils')
const { tryCatch } = require('./utils/either')
const Task = require('data.task')

const getConfig = fileUtils
  .readFile('./config.json')
  .map(config => tryCatch(() => JSON.parse(config)))
  .chain(r => r.fold(
    Task.rejected,
    c => Task.of(c)
    ))

module.exports = {getConfig}
