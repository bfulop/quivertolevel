const Task = require('data.task')

const addNoteToMongo = r => {
  console.log('note added', r)
  return Task.of('success')
}

module.exports = { addNoteToMongo }
