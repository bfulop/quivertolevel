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
  return db.get(r).then(Maybe.Just).catch(Maybe.Nothing)
}
const batchT = fromPromised(db.batch)
const getT = fromPromised(safeGet)

const createRecord = (k, v) => ({ type: 'put', key: k, value: v})

const addNoteToDB = ({ notekey, anotebookkey, notebookkey, value }) => {
  const baseinfo = [
    { type: 'put', key: notekey, value: 'hats' },
    { type: 'put', key: anotebookkey, value: 0 },
    { type: 'put', key: notebookkey, value: 0 }
  ]
  return getT('nobook:new_nbookid')
    .map(r => r.map(t => createRecord('none', 0)))
    .map(r => r.getOrElse(createRecord('nobook:new_nbookid', {updated_at: 112})))
    .map(r => [r])
    .map(logger)
    .map(R.concat(baseinfo))
    // .map(
    //   R.ifElse(
    //     R.isEmpty,
    //     r => R.append(
    //       {
    //         type: 'put',
    //         key: `nobook:new_nbookid`,
    //         value: { updated_at: 112 }
    //       },
    //       baseinfo
    //     ),
    //     R.identity
    //   )
    // )
    .chain(batchT)
}

const addNoteBookToDB = r => {
  console.log('notebook added', r)
  return of('success')
}

module.exports = { addNoteToDB, addNoteBookToDB }
