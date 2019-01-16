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

const batchT = b =>
  task(r => {
    db()
      .batch(b)
      .then(r.resolve)
      .catch(r.reject)
  })

const buildUniqueTags = t =>
  R.compose(
    R.over(R.lensPath([t, 'count']), R.inc),
    R.mergeDeepRight(R.objOf(t, { count: 0 }))
  )
const creatUniqueTagId = R.compose(
  R.concat('atag:'),
  R.nth(1),
  R.split(':')
)
const getUniqueTags = () =>
  task(r => {
    let uniqueTags = {}
    db()
      .createKeyStream({ gt: 'tagsnotes:', lt: 'tagsnotes:~' })
      .on('data', t => {
        uniqueTags = buildUniqueTags(creatUniqueTagId(t))(uniqueTags)
      })
      .on('end', () => r.resolve(uniqueTags))
  })
const toTagDBInput = ([key, val]) =>
  R.compose(
    R.assoc('type', 'put'),
    R.assoc('key', key),
    R.objOf('value')
  )(val)

const listTags = () =>
  getUniqueTags()
    .map(
      R.compose(
        R.map(toTagDBInput),
        R.toPairs
      )
    )
    .chain(batchT)

const prepareUniqueSiblingData = R.compose(
  R.map(R.over(R.lensProp('count'), R.inc)),
  R.map(t => t.getOrElse({ count: 0 })),
  getT
)

// tagsiblings:atag1:siblings:atag2:note001
// atagsibling:atag1:atag2
const createUniqueSiblingId = R.compose(
  R.converge(R.unapply(R.reduce(R.concat, 'atagsibling:')), [
    R.nth(1),
    () => ':',
    R.nth(3)
  ]),
  R.split(':')
)

const getUniqueSiblings = () =>
  task(r => {
    let uniqueTags = {}
    db()
      .createKeyStream({ gt: 'tagsiblings:', lt: 'tagsiblings:~' })
      .on('data', t => {
        uniqueTags = buildUniqueTags(createUniqueSiblingId(t))(uniqueTags)
      })
      .on('end', () => r.resolve(uniqueTags))
  })

const listSiblings = () =>
  getUniqueSiblings()
    .map(
      R.compose(
        R.map(toTagDBInput),
        R.toPairs
      )
    )
    .chain(batchT)

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
  R.map(R.assoc('type', 'put')),
  processASiblingRatio
)
const calcRatios = () =>
  task(r => {
    let atagupdatexs = []
    db()
      .createReadStream({ gt: 'atagsibling:', lt: 'atagsibling:~' })
      .on('data', t => atagupdatexs.push(t))
      .on('end', () => r.resolve(atagupdatexs))
  })
    .map(R.map(processRatios))
    .chain(waitAll)
    .chain(batchT)

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
  R.map(R.assoc('type', 'put')),
  R.map(
    R.converge(
      (nums, data) =>
        R.assocPath(['value', 'child'], R.apply(R.gt)(nums), data),
      [
        R.compose(
          R.values,
          R.pick(['ratio', 'childratio']),
          R.prop('value')
        ),
        R.identity
      ]
    )
  ),
  importRatio
)
const summariseRatios = () =>
  task(r => {
    let atagupdatexs = []
    db()
      .createReadStream({ gt: 'atagsibling:', lt: 'atagsibling:~' })
      .on('data', t => atagupdatexs.push(t))
      .on('end', () => r.resolve(atagupdatexs))
  })
    .map(R.map(compareRatios))
    .chain(waitAll)
    .chain(batchT)

const enumChildren = tagId =>
  task(r => {
    let parentratio = 0
    const createsiblingselector = R.compose(
      R.over(R.lensProp('lt'), R.concat(R.__, '~')),
      R.zipObj(['gt', 'lt']),
      R.repeat(R.__, 2),
      R.concat('atagsibling:')
    )

    db()
      .createValueStream(createsiblingselector(tagId))
      .on('data', t => {
        parentratio = R.ifElse(
          R.prop('child'),
          () => R.inc(parentratio),
          () => R.dec(parentratio)
        )(t)
      })
      .on('end', () => r.resolve(parentratio))
  })

const calcParentRatio = R.converge(
  (ratioT, tag) =>
    ratioT.map(ratio => R.assocPath(['value', 'parentratio'], ratio, tag)),
  [
    R.compose(
      enumChildren,
      R.compose(
        R.nth(1),
        R.split(':')
      ),
      R.prop('key')
    ),
    R.identity
  ]
)

const calcParentRatioTest = () =>
  of({ key: 'atag:atag1', value: { count: 4, parentratio: 1, istrue: false } })

const setParentRatio = R.compose(
  R.chain(t => putT(t.key, t.value)),
  calcParentRatio
)

const addParentRatio = () =>
  task(r => {
    let atagupdatexs = []
    db()
      .createReadStream({ gt: 'atag:', lt: 'atag:~' })
      .on('data', t => atagupdatexs.push(t))
      .on('end', () => r.resolve(atagupdatexs))
  })
    .map(R.map(setParentRatio))
    .chain(waitAll)

const processTags = () =>
  listTags()
    .chain(listSiblings)
    // R.traverse(of, R.call, [listUniqueTags, listSiblings])
    .chain(calcRatios)
    .chain(summariseRatios)
    .chain(addParentRatio)

module.exports = { processTags }
