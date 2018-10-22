const { task, of, fromPromised } = require('folktale/concurrency/task')
const levelup = require('levelup')
const leveldown = require('leveldown')
const R = require('ramda')

const logger = r => {
  console.log('r', r)
  return r
}
const db = levelup(leveldown('./testdb'))
const safeGet = r => {
  return db.get(r).catch(e => [])
}
const batchT = fromPromised(db.batch)
const getT = fromPromised(safeGet)

const addNoteToDB = ({ notekey, anotebookkey, notebookkey, value }) => {
  const baseinfo = [
    { type: 'put', key: notekey, value: 'hats' },
    { type: 'put', key: anotebookkey, value: 0 },
    { type: 'put', key: notebookkey, value: 0 }
  ]
  return getT('nobook:new_nbookid')
    .map(logger)
    .map(
      R.ifElse(
        R.isEmpty,
        r => R.append(
          {
            type: 'put',
            key: `nobook:new_nbookid`,
            value: { updated_at: 112 }
          },
          baseinfo
        ),
        R.identity
      )
    )
    .chain(batchT)
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return of('success')
}

module.exports = { addNoteToDB, addNoteBookToDB }
