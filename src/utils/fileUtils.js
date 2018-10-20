const fs = require('fs')
const path = require('path')
const { task } = require('folktale/concurrency/task')

function readFile (filename) {
  return task(resolver =>
    fs.readFile(
      path.resolve(filename),
      'utf-8',
      (err, contents) => (err ? resolver.reject(err) : resolver.resolve(contents))
    )
  )
}

function readDir (dirpath) {
  return task(resolver => 
    fs.readdir(
      path.resolve(dirpath),
      'utf-8',
      (err, contents) => (err ? resolver.reject(err) : resolver.resolve(contents))
    )
  )
}


module.exports = { readFile, readDir }
