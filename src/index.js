const processFolders = require('./processFolders')
const { addNoteToDB } = require('./addToDB')
const { List } = require('immutable-ext')
const { of } = require('folktale/concurrency/task')
const flattenNoteBook = require('./flattenNoteBook')
const createKeys = require('./createKeys')

const logger = r => {
  console.log('hhhhhh %o', r)
  return r
}
const upload = () => processFolders()
  .chain(xs => xs.traverse(of, flattenNoteBook))
  .map(r => r.fold())
  .map(xs => xs.map(r => createKeys(r)))
  .chain(xs => xs.traverse(of, addNoteToDB))
  .map(xs => xs.fold([]))

module.exports = upload
