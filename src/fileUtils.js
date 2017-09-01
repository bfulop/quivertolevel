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

function testTask (aname) {
  return new Task((rej, res) => res(aname))
}

module.exports = { readFile, testTask }
