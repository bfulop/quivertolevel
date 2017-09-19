const Task = require('data.task')

const addNoteToDB = r => {
  console.log('note added', r)
  return Task.of('success')
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return Task.of('success')
}



module.exports = { addNoteToDB, addNoteBookToDB }
