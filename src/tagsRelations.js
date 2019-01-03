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

const processSibling = tag => R.over(R.lensProp('child'), () => true)

const processTagOld = tag =>
  R.over(R.lensProp('siblings'), R.map(processSibling(tag)), tag)

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
  R.converge((tag, ratiosT) => ratiosT.map(R.mergeDeepWith(R.assoc('childratio'), R.__, tag)),
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
  ])

const processRelations = tagName =>
  R.compose(
    waitAll,
    R.map(task =>
      task.chain(maybe => maybe.map(processTagTask(tagName)).getOrElse(of('hoho')))
    ),
    R.map(getT),
    R.map(R.concat('tags:'))
  )(tagName)

const calcRelations = processRelations

module.exports = { processRelations, calcRelations }
