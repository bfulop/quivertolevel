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

const tagsRelatedValues = {
  key: R.compose(
    R.nth(1),
    R.split(':')
  ),
  value: R.path(['note', 'meta', 'tags'])
}
const prepareTagData = R.compose(
  R.pick(['key', 'value']),
  R.evolve(tagsRelatedValues),
  R.find(R.propSatisfies(R.match(/^anote:/), 'key'))
)

const prepareTag = (noteId, tags) =>
  R.converge(
    (tagT, tagId) =>
      tagT.map(r =>
        r.orElse(() => Maybe.Just({
          notes: [],
          siblings: []
        }))
        .map(R.over(R.lensProp('notes'), R.append(noteId)))
        .map(R.over(R.lensProp('siblings'), R.concat(R.without([tagId], tags))))
        .map(R.objOf('value'))
        .map(R.assoc('type', 'put'))
        .map(R.assoc('key', R.concat('tags:', tagId)))
        .getOrElse('what?')
      ),
    [R.compose(getT, R.concat('tags:')), R.identity]
  )

const createTags = R.compose(
  waitAll,
  ([id, tags]) => tags.map(prepareTag(id, tags)),
  R.values,
  prepareTagData
)

const insertTags = R.converge((r, xs) => r.map(R.concat(xs)), [
  createTags,
  R.identity
])

module.exports = insertTags
