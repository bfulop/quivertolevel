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

const processASiblingRatio = R.converge(
  (siblingTag, siblingCount, targetCountT) =>
    R.map(targetCount =>
      R.assocPath(
        ['value', 'ratio'],
        R.divide(targetCount, siblingCount),
        siblingTag
      )
    )(targetCountT),
  [
    R.identity,
    R.path(['value', 'count']),
    R.compose(
      R.map(R.path(['value', 'count'])),
      getT,
      R.concat('atag:'),
      R.compose(
        R.nth(1),
        R.split(':')
      ),
      R.prop('key')
    )
  ]
)

const processRatios = R.compose(
  r => r.run(),
  R.chain(t => putT(R.prop('key', t), R.prop('value', t))),
  processASiblingRatio
)
const calcRatios = () =>
  task(r => {
    db()
      .createReadStream({ gt: 'atagsibling:', lt: 'atagsibling:~' })
      .on('data', processRatios)
      .on('end', () => r.resolve())
  })

const importRatio = R.converge(
  (ratioT, tag) =>
    R.map(ratio => R.assocPath(['value', 'childratio'], ratio, tag), ratioT),
  [
    R.compose(
      R.map(R.path(['value', 'ratio'])),
      getT,
      R.concat('atagsibling:'),
      R.compose(
        R.join(':'),
        R.reverse(),
        R.drop(1),
        R.split(':')
      ),
      R.prop('key')
    ),
    R.identity
  ]
)

const compareRatios = R.compose(
  r => r.run(),
  R.chain(t => putT(R.prop('key', t), R.prop('value', t))),
  R.map(
    R.converge(
      (nums, data) => R.assocPath(['value', 'child'], R.apply(R.gt, nums), data),
      [
        R.compose(
          R.values,
          R.pick(['ratio', 'childratio']),
          R.prop('value'),
        ),
        R.identity
      ]
    )
  ),
  // R.map(logger),
  importRatio
)
const summariseRatios = () =>
  task(r => {
    db()
      .createReadStream({ gt: 'atagsibling:', lt: 'atagsibling:~' })
      .on('data', compareRatios)
      .on('end', () => r.resolve())
  })

const processTags = () =>
  R.traverse(of, R.call, [listUniqueTags, listSiblings])
    .chain(calcRatios)
    .chain(summariseRatios)

module.exports = { processTags }
