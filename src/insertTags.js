const { task, of, fromPromised } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const levelup = require('levelup')
const encode = require('encoding-down')
const leveldown = require('leveldown')


const db = levelup(encode(leveldown('./quiverdb'), { valueEncoding: 'json' }))

const safeGet = r =>
  db
    .get(r)
    .then(Maybe.Just)
    .catch(Maybe.Nothing)

const getT = fromPromised(safeGet)

const insertTags = r => getT().map(r => r.getOrElse('dunno'))

module.exports = insertTags
