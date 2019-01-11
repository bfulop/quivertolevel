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
const putT = R.curry((key, value) =>
  fromPromised((k, v) => db().put(k, v))(key, value)
)

const prepareUniqueTagData = R.compose(
  R.map(R.over(R.lensProp('count'), R.inc)),
  R.map(t => t.getOrElse({ count: 0 })),
  getT
)
const insertUniqueTag = R.curry((tagId, tagRecordT) =>
  R.compose(
    R.invoker(0, 'run'),
    R.chain(putT(tagId))
  )(tagRecordT)
)

const processUniqueTag = R.compose(
  R.converge(insertUniqueTag, [R.identity, prepareUniqueTagData]),
  R.concat('atag:'),
  R.compose(
    R.nth(1),
    R.split(':')
  )
)

const listUniqueTags = () =>
  task(r => {
    db()
      .createKeyStream({ gt: 'tagsnotes:', lt: 'tagsnotes:~' })
      .on('data', processUniqueTag)
      .on('end', () => r.resolve())
  })

const prepareUniqueSiblingData = R.compose(
  R.map(R.over(R.lensProp('count'), R.inc)),
  R.map(t => t.getOrElse({ count: 0 })),
  getT
)
const processUniqueSibling = R.compose(
  R.converge(insertUniqueTag, [R.identity, prepareUniqueSiblingData]),
  R.concat('atagsibling:'),
  R.converge(R.unapply(R.reduce(R.concat, '')), [
    R.nth(1),
    () => ':',
    R.nth(2)
  ]),
  R.split(':')
)

const listSiblings = () =>
  task(r => {
    db()
      .createKeyStream({ gt: 'tagsiblings:', lt: 'tagsiblings:~' })
      .on('data', processUniqueSibling)
      .on('end', () => r.resolve())
  })

const processTags = () => R.traverse(of, R.call, [listUniqueTags, listSiblings])

module.exports = { processTags }
