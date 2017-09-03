const fileUtils = require('./utils/fileUtils')
const { tryCatch } = require('./utils/either')
const Task = require('data.task')

const smartlog = f => (f && f.inspect) ? f.inspect() : f

const getConfig = fileUtils
  .readFile('../config.json')
  .map(c => {
    console.log(smartlog(c))
    return c
  })
  .map(config => tryCatch(() => JSON.parse(config)))
  .map(c => c /* ? smartlog(c) */)
  .chain(r => r.fold(
    Task.rejected, 
    c => {
      console.log(smartlog(c))
      return Task.of(c)
    }
    ))
  .map(c => c /* ? smartlog(c) */)
  .map(c => c.mongodb)
  .map(c => {
    console.log(smartlog(c))
    return c
  })

getConfig

getConfig.fork(
  t => {
    console.log(smartlog(t))
    return t
  },
  t => {
    console.log(smartlog(t))
    return t
  })

module.exports = {getConfig}
