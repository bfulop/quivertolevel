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

const addChildRatio = length =>
  R.converge(R.assoc('ratio'), [
    R.compose(
      R.divide(length),
      R.prop('count')
    ),
    R.identity
  ])

const calcChildState = R.converge(R.set(R.lensProp('child')), [
  R.converge(R.gte, [R.prop('ratio'), R.prop('childratio')]),
  R.identity
])

const setChildState = length =>
  R.compose(
    calcChildState,
    addChildRatio(length)
  )

const calcParentRatio = R.converge(R.assoc('parentratio'), [
  R.converge(
    R.subtract, [
    R.compose(
      R.length,
      R.filter(R.prop('child')),
      R.values,
      R.prop('siblings')
    ),
    R.compose(
      R.length,
      R.filter(R.compose(R.not, R.prop('child'))),
      R.values,
      R.prop('siblings')
    )
  ]),
  R.identity
])
const calcRatios = R.converge(
  (length, tag) =>
    R.over(R.lensProp('siblings'), R.map(setChildState(length)), tag),
  [
    R.compose(
      R.length,
      R.prop('notes')
    ),
    R.identity
  ]
)

const calcRatio = tagName =>
  R.converge(R.divide, [
    R.compose(
      R.length,
      R.prop('notes')
    ),
    R.path(['siblings', tagName, 'count'])
  ])

const getRatio = tagName =>
  R.converge(R.pair, [
    of,
    R.compose(
      t => t.map(d => d.map(calcRatio(tagName)).getOrElse()),
      R.compose(
        getT,
        R.concat('tags:')
      )
    )
  ])

const processTagTask = tagName =>
  R.converge(
    (tag, ratiosT) =>
      ratiosT.map(R.mergeDeepWith(R.assoc('childratio'), R.__, tag)),
    [
      R.identity,
      R.compose(
        R.map(R.objOf('siblings')),
        R.map(R.fromPairs),
        waitAll,
        R.map(waitAll),
        R.map(getRatio(tagName)),
        R.keys,
        R.prop('siblings')
      )
    ]
  )

const updateSecond = R.over(R.lensIndex(1))
const processRelations = R.compose(
  waitAll,
  R.map(([tagname, task]) =>
    task
      .map(calcRatios)
      .map(calcParentRatio)
      .map(R.objOf('value'))
      .map(R.assoc('type', 'put'))
      .map(R.assoc('key', R.concat('tags:', tagname)))
  ),
  R.map(r =>
    updateSecond(t =>
      t.chain(maybe => maybe.map(processTagTask(R.head(r))).getOrElse(of(null)))
    )(r)
  ),
  R.map(updateSecond(getT)),
  R.map(updateSecond(R.concat('tags:'))),
  R.map(R.repeat(R.__, 2)),
  R.map(R.invoker(1, 'substring')(5))
)

const getAllTags = () =>
  task(r => {
    let tagxs = []
    const append = R.invoker(1, 'push')
    const appendList = append(R.__, tagxs)
    db()
      .createKeyStream({ gt: 'tags:' })
      .on('data', appendList)
      .on('end', t => r.resolve(tagxs))
  })

const calcRelations = () =>
  getAllTags()
    .chain(processRelations)
    .map(r =>
      db().batch(r, () => {
        console.log('tags updated')
        return true
      })
    )

module.exports = { processRelations, calcRelations }
