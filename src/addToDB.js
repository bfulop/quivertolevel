const Task = require('data.task')
const levelup = require('levelup')
const leveldown = require('leveldown')

const db = levelup('./testdb', { db: leveldown })

const addNoteToDB = ({ key, value }) => {
  console.log(value)
  return new Task((rej, res) =>
    db.put(key, JSON.stringify(value), err => (err ? rej(err) : res('note saved')))
  )
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return Task.of('success')
}

module.exports = { addNoteToDB, addNoteBookToDB }
