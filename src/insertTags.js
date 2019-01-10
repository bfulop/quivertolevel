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

const getNoteMeta = R.compose(
  R.converge(R.assoc('nbook'), [
    R.path(['value', 'note', 'nbook']),
    R.path(['value', 'note', 'meta'])
  ]),
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
          .map(
            R.over(
              R.lensProp('siblings'),
              updateSiblingsList(tagId)(R.prop('tags', noteMeta))
            )
          )
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

const addANoteToList = noteMeta =>
  R.compose(
    R.assocPath(['value', 'meta'], noteMeta),
    R.assoc('type', 'put'),
    R.objOf('key'),
    R.concat(R.__, R.prop('uuid', noteMeta)),
    R.concat(R.__, ':'),
    R.concat(R.__, R.prop('created_at', noteMeta)),
    R.concat(R.__, ':notes:'),
    R.concat('tags:')
  )
const notesToTagsList = R.converge(
  (tagxs, noteMeta) => tagxs.map(addANoteToList(noteMeta)),
  [R.prop('tags'), R.identity]
)
const addTagToSibling = R.curry((tagxs, noteId, tagId) =>
  R.compose(
    R.map(
      R.compose(
        R.assoc('type', 'put'),
        R.objOf('key'),
        R.concat(R.__, noteId),
        R.concat(R.__, ':'),
        R.concat(R.__, tagId),
        R.concat(R.__, ':siblings:'),
        R.concat('tags:')
      )
    ),
    R.reject(R.equals(tagId))
  )(tagxs)
)

const tagsToSiblingsList = R.converge(
  (tagxs, noteId) => tagxs.map(addTagToSibling(tagxs, noteId)),
  [R.prop('tags'), R.prop('uuid')]
)
const addNoteBookToTag = noteMeta => R.compose(
  R.assoc('type', 'put'),
  R.objOf('key'),
  R.concat(R.__, R.prop('uuid', noteMeta)),
  R.concat(R.__, ':notes:'),
  R.concat(R.__, R.path(['nbook', 'uuid'], noteMeta)),
  R.concat(R.__, ':notebooks:'),
  R.concat('tags:')
)
const notebooksToTagsList = R.converge(
  (tagxs, noteMeta) => tagxs.map(addNoteBookToTag(noteMeta)),
  [R.prop('tags'), R.identity]
)

const createPutCommands = R.compose(
  R.flatten,
  R.converge(R.unapply(R.reduce(R.concat, [])), [
    notebooksToTagsList,
    notesToTagsList,
    tagsToSiblingsList
  ]),
  getNoteMeta
)

const insertTags = R.converge(R.concat, [createPutCommands, R.identity])

module.exports = insertTags
