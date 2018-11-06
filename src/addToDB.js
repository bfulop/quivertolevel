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

// const batchT = fromPromised(db.batch)
const batchT = b => task(r => {
  db.batch(b)
  .then(r.resolve)
  .catch(r.reject)
})

const getT = fromPromised(safeGet)

const createRecord = ({ key, val }) => ({ type: 'put', key: key, value: val })

const maybeAddNotebook = (anotebookkey, notebookkey, value) =>
  R.compose(
    R.ifElse(
      R.gt(getSecondId(anotebookkey)),
      R.compose(
        R.concat(createNewNotebook(anotebookkey, notebookkey, value)),
        r => [r],
        R.merge({type: 'del'}),
        R.objOf('key'),
        r => R.concat(r, R.concat(':', getFirstId(anotebookkey))),
        R.concat('notebooks:'),
        R.toString
      ),
      r => []
    ),
    R.prop('updated_at')
  )

const createNewNotebook = (anotebookkey, notebookkey, value) =>
  R.map(createRecord)([
    {
      key: extractNotebookId(anotebookkey),
      val: { updated_at: getFirstId(notebookkey) }
    },
    { key: notebookkey, val: R.path(['nbook', 'name'], value) }
  ])

const getSecondId = R.compose(
  R.nth(2),
  R.split(':')
)
const getFirstId = R.compose(
  R.nth(1),
  R.split(':')
)
const extractNotebookId = R.compose(
  R.concat('nobook:'),
  getFirstId
)

const addNoteToDB = ({ notekey, anotebookkey, notebookkey, value }) => {
  const baseinfo = [
    { type: 'put', key: notekey, value: value },
    { type: 'put', key: anotebookkey, value: R.path(['note', 'meta', 'title'], value) }
  ]
  return getT(extractNotebookId(anotebookkey))
    .map(r => r.map(maybeAddNotebook(anotebookkey, notebookkey, value)))
    .map(r => r.getOrElse(createNewNotebook(anotebookkey, notebookkey, value)))
    .map(R.concat(baseinfo))
    .chain(batchT)
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return of('success')
}

module.exports = { addNoteToDB, addNoteBookToDB }
