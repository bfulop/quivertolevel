const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const levelup = require('levelup')
const encode = require('encoding-down')
const leveldown = require('leveldown')

const logger = r => {
  console.log('----------------------------')
  console.log(r)
  return r
}

const db = levelup(encode(leveldown('./quiverdb'), { valueEncoding: 'json' }))

const safeGet = r =>
  db
    .get(r)
    .then(Maybe.Just)
    .catch(Maybe.Nothing)

const getT = fromPromised(safeGet)

const getATag = R.compose(
  R.map(r =>
    r.getOrElse({
      type: 'put',
      key: 'tags:tag001',
      value: {
        notes: ['note001']
      }
    })
  ),
  getT
)
const prepareTags = R.compose(
  getATag,
  R.head(),
  R.path(['value', 'note', 'meta', 'tags']),
  R.find(R.propSatisfies(R.match(/^anote:/), 'key'))
)
const tagsRelated = {
  key: R.compose(
    R.nth(1),
    R.split(':')
  ),
  value: R.path(['note', 'meta', 'tags'])
}
const prepareTagData = R.compose(
  R.pick(['key', 'value']),
  R.evolve(tagsRelated),
  R.find(R.propSatisfies(R.match(/^anote:/), 'key'))
)

const getTags = id =>
  R.converge(
    (tagT, tagId) =>
      tagT.map(r =>
        r.getOrElse({
          key: tagId,
          value: []
        })
      ),
    [getT, R.identity]
  )

// const getTags = id => tag => of(id)

const createTags = R.compose(
  waitAll,
  ([id, tags]) => tags.map(getTags(id)),
  R.values,
  prepareTagData
)

const insertTags = R.converge((r, xs) => r.map(R.concat(xs)), [
  createTags,
  R.identity
])

module.exports = insertTags
