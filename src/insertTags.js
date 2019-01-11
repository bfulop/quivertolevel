const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const db = require('./utils/db')

const logger = r => {
  console.log('----------------------------')
  console.log(r)
  return r
}

const getNoteMeta = R.compose(
  R.converge(R.assoc('nbook'), [
    R.path(['value', 'note', 'nbook']),
    R.path(['value', 'note', 'meta'])
  ]),
  R.find(R.propSatisfies(R.match(/^anote:/), 'key'))
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
    R.concat('tagsnotes:')
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
        R.concat('tagsiblings:')
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
  R.concat('tagsnotebooks:')
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
