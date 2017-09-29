const fs = require('fs')
const path = require('path')
const Task = require('data.task')

function readFile (filename) {
  return new Task((rej, res) =>
    fs.readFile(
      path.resolve(filename),
      'utf-8',
      (err, contents) => (err ? rej(err) : res(contents))
    )
  )
}

function readDir (dirpath) {
  return new Task((rej, res) =>
    fs.readdir(
      path.resolve(dirpath),
      'utf-8',
      (err, contents) => (err ? rej(err) : res(contents))
    )
  )
}


module.exports = { readFile, readDir }
