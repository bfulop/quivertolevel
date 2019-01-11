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
const batchT = fromPromised(t => db().batch(t))
const putT = R.curry((key, value) =>
  fromPromised((k, v) => db().put(k, v))(key, value)
)

const getTagTask = R.compose(
  R.map(R.over(R.lensProp('count'), R.inc)),
  R.map(t => t.getOrElse({ count: 0 })),
  getT
)
const putUniqueTag = R.curry((tagId, tagRecordT) =>
  R.map(
    R.compose(
      R.assoc('type', 'put'),
      R.assoc('key', tagId),
      R.objOf('value')
    )
  )(tagRecordT)
)

const atagUpdate = R.compose(
  R.converge(putUniqueTag, [R.identity, getTagTask]),
  R.concat('atag:'),
  R.compose(
    R.nth(1),
    R.split(':')
  ),
)

const atagsiblingUpdate = () =>
  of({ type: 'put', key: 'atagsibling:atag1:atag2', value: { count: 2 } })

const getPutCommands = R.converge(R.unapply(waitAll), [
  atagsiblingUpdate,
  atagUpdate
])

const runUpdates = R.compose(
  R.invoker(0, 'run'),
  R.chain(batchT),
  getPutCommands,
)

const listUniqueTags = () =>
  task(r => {
    let tagxs = []
    const append = R.invoker(1, 'push')
    db()
      .createKeyStream({ gt: 'tagsnotes:', lt: 'tagsnotes:~' })
      .on('data', runUpdates)
      .on('end', () =>
        R.compose(
          r.resolve,
          R.uniq
        )(tagxs)
      )
  })

const processTags = () => listUniqueTags().map(R.map(R.concat('yes')))

module.exports = { processTags }
