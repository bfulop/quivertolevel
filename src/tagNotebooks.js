const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const db = require('./utils/db')

const logger = r => {
  console.log('----------------------------')
  console.log(r)
  return r
}

const batchT = b =>
  task(r => {
    db()
      .batch(b)
      .then(r.resolve)
      .catch(r.reject)
  })

const safeGet = r =>
  db()
    .get(r)
    .then(Maybe.Just)
    .catch(Maybe.Nothing)

const getT = fromPromised(safeGet)
const putT = R.curry((key, value) =>
  fromPromised((k, v) => db().put(k, v))(key, value)
)

const update = R.compose(
  R.over(R.lensPath(['shoes', 'count']), R.inc),
  R.mergeDeepRight({ shoes: { count: 0 } })
)
const groupNoteTags = (tag, notebook) =>
  R.compose(
    R.over(R.lensPath([tag, notebook, 'count']), R.inc),
    R.mergeDeepRight(R.objOf(tag, R.objOf(notebook, { count: 0 })))
  )

const getTagId = R.compose(
  R.nth(1),
  R.split(':')
)
const getTagNotebookId = R.compose(
  R.nth(3),
  R.split(':')
)

const summarizeNotebooks = () =>
  task(r => {
    let notebookgroups = {}
    db()
      .createKeyStream({ gt: 'tagsnotebooks:', lt: 'tagsnotebooks:~' })
      .on('data', t => {
        notebookgroups = groupNoteTags(getTagId(t), getTagNotebookId(t))(
          notebookgroups
        )
      })
      .on('end', () => r.resolve(notebookgroups))
  })

const createsiblingselector = prefix =>
  R.compose(
    R.over(R.lensProp('lt'), R.concat(R.__, '~')),
    R.zipObj(['gt', 'lt']),
    R.repeat(R.__, 2),
    R.concat(prefix)
  )
const getNotebookSize = ([nbookid, val]) =>
  task(r => {
    let nbooksize = 0
    db()
      .createKeyStream(createsiblingselector('anotebook:')(nbookid))
      .on('data', () => (nbooksize = R.inc(nbooksize)))
      .on('end', () => r.resolve([nbookid, R.assoc('size', nbooksize, val)]))
  })

const processTagsNotebooks = R.compose(
  waitAll,
  R.map(getNotebookSize),
  R.toPairs
)

const processATagWNbook = ([tagid, tagval]) =>
  processTagsNotebooks(tagval).map(
    R.compose(
      R.objOf(tagid),
      R.fromPairs
    )
  )

const importNotebookSizes = R.compose(
  waitAll,
  R.map(processATagWNbook),
  R.toPairs
)

// 'atagnotebook:atag:50:nbook1'
const calcRatio = R.converge(
  R.compose(
    R.toString,
    R.subtract(100),
    Math.round,
    R.multiply(100),
    R.divide
  ),
  [R.prop('count'), R.prop('size')]
)
const createSortedKey = (tagid, nbookid, val) =>
  R.compose(
    R.concat(R.__, nbookid),
    R.concat(R.__, ':'),
    R.concat(R.__, calcRatio(val)),
    R.concat(R.__, ':'),
    R.concat('atagnotebook:')
  )(tagid)

const prepareSortedNotebook = tagid => ([nbookid, val]) =>
  R.compose(
    R.assoc('type', 'put'),
    R.assoc('key', createSortedKey(tagid, nbookid, val)),
    R.objOf('value')
  )(val)

const preparePutCommand = R.compose(
  ([id, val]) =>
    R.compose(
      R.map(prepareSortedNotebook(id)),
      R.toPairs
    )(val),
  R.unnest,
  R.toPairs
)
const insertTaggedNotebookToDB = R.compose(
  batchT,
  R.unnest,
  R.map(preparePutCommand)
)

const processNotebooks = () =>
  summarizeNotebooks()
    .chain(importNotebookSizes)
    .chain(insertTaggedNotebookToDB)

module.exports = {
  processNotebooks,
  summarizeNotebooks,
  importNotebookSizes
}
