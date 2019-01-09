const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const db = require('./utils/db')

const logger = r => {
  console.log('----------------------------')
  console.log(r)
  return r
}

const safeGet = r =>
  db()
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
  R.path(['value', 'note', 'meta']),
  R.find(R.propSatisfies(R.match(/^anote:/), 'key'))
)

const incCount = (k, l, r) => (k == 'count' ? r + 1 : r)

const updateSiblingsList = tagId =>
  R.compose(
    R.mergeDeepWithKey(incCount),
    R.fromPairs,
    R.map(R.pair(R.__, { count: 1, child: false })),
    R.reject(R.equals(tagId))
  )

// const prepareTag = (noteId, tagxs) =>
const prepareTag = noteMeta =>
  R.converge(
    (tagT, tagId) =>
      tagT.map(r =>
        r
          .orElse(() =>
            Maybe.Just({
              name: tagId,
              notes: [],
              siblings: {}
            })
          )
          .map(R.over(R.lensProp('notes'), R.append(noteMeta)))
          .map(R.over(R.lensProp('siblings'), updateSiblingsList(tagId)(R.prop('tags', noteMeta))))
          .map(R.objOf('value'))
          .map(R.assoc('type', 'put'))
          .map(R.assoc('key', R.concat('tags:', tagId)))
          .getOrElse(null)
      ),
    [
      R.compose(
        getT,
        R.concat('tags:')
      ),
      R.identity
    ]
  )

  // ([id, tags]) => tags.map(prepareTag(id, tags)),
const createTags = R.compose(
  waitAll,
  noteMeta => R.compose(R.map(prepareTag(noteMeta)), R.prop('tags'))(noteMeta),
  prepareTagData
)

const insertTags = R.converge((r, xs) => r.map(R.concat(xs)), [
  createTags,
  R.identity
])

module.exports = insertTags
