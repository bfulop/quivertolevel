const { task, of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const leveldown = require('leveldown')

const db  = levelup(leveldown('./testdb'))

const addNoteToDB = ({ key, value }) => {
  console.log(value)
  return task(resolver =>
    db.put(key, JSON.stringify(value), err => (err ? resolve.reject(err) : resolver.resolve('note saved')))
  )
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return of('success')
}

module.exports = { addNoteToDB, addNoteBookToDB }
