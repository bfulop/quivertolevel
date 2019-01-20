const R = require('ramda')
const processFolders = require('./processFolders')
const { addNoteToDB } = require('./addToDB')
const { List } = require('immutable-ext')
const { of, waitAll } = require('folktale/concurrency/task')
const flattenNoteBook = require('./flattenNoteBook')
const createKeys = require('./createKeys')
const { processTags } = require('./tagsRelations')
const { createTimelines } = require('./tagTimeline')
const { findTags } = require('./addTags')

const logger = r => {
  console.log('index.js ****************')
  console.log('hhhhhh %o', r)
  return r
}
const upload = () => processFolders()
  .chain(xs => xs.traverse(of, flattenNoteBook))
  .map(r => r.fold())
  .map(R.map(findTags))
  .chain(waitAll)
  .map(R.map(createKeys))
  .map(List)
  .chain(xs => xs.traverse(of, addNoteToDB))
  .map(xs => xs.fold([]))
  .chain(processTags)
  .chain(createTimelines)

module.exports = upload
