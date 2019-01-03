const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const db = require('./utils/db')

const logger = r => {
  console.log('----------------------------')
  console.log(r)
  return r
}

// const db = levelup(encode(leveldown('./quiverdb'), { valueEncoding: 'json' }))

const safeGet = r =>
  db()
    .get(r)
    .then(Maybe.Just)
    .catch(Maybe.Nothing)

const getT = fromPromised(safeGet)

const processRelations = tagsList => of(tagsList)

const calcRelations = processRelations

module.exports = { processRelations, calcRelations }
