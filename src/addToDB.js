const { task, of, fromPromised } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const levelup = require('levelup')
const leveldown = require('leveldown')
const R = require('ramda')

const logger = r => {
  console.log('r', r)
  return r
}
const db = levelup(leveldown('./testdb'))
const safeGet = r => {
  return db
    .get(r)
    .then(Maybe.Just)
    .catch(Maybe.Nothing)
}
const batchT = fromPromised(db.batch)
const getT = fromPromised(safeGet)

const createRecord = ({ key, val }) => ({ type: 'put', key: key, value: val })

const latestNotebook = nobook => []
const addNewNoteBook = R.map(createRecord)

const getFirstId = R.compose(
  R.nth(1),
  R.split(':')
)
const createNobookId = R.compose(
  R.concat('nobook:'),
  getFirstId
)

const addNoteToDB = ({ notekey, anotebookkey, notebookkey, value }) => {
  const baseinfo = [
    { type: 'put', key: notekey, value: 'hats' },
    { type: 'put', key: anotebookkey, value: 0 }
  ]
  return getT(createNobookId(anotebookkey))
    .map(r => r.map(latestNotebook))
    .map(r =>
      r.getOrElse(
        R.map(createRecord)([
          {
            key: createNobookId(anotebookkey),
            val: { updated_at: getFirstId(notebookkey) }
          },
          { key: notebookkey, val: 0 }
        ])
      )
    )
    .map(R.concat(baseinfo))
    .chain(batchT)
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return of('success')
}

module.exports = { addNoteToDB, addNoteBookToDB }
