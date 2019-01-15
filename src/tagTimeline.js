const R = require('ramda')
const { task, of, fromPromised, waitAll } = require('folktale/concurrency/task')
const Maybe = require('folktale/maybe')
const db = require('./utils/db')
const getUnixTime = require('date-fns/fp/getUnixTime')
const addMonths = require('date-fns/fp/addMonths')
const differenceInMonths = require('date-fns/fp/differenceInMonths')

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

const startdate = () => new Date(2015, 8, 1)
const addMonthsC = R.curry((date, amount) => addMonths(amount)(date))
const datexs = R.times(addMonthsC(startdate()))

const createQuery = tagid =>
  R.compose(
    R.concat,
    R.concat(R.__, ':notes:'),
    R.concat('tagsnotes:')
  )(tagid)

const createmonthqueries = R.curry((monthsNum, tagid) =>
  R.compose(
    R.map(R.zipObj(['gt', 'lt'])),
    R.map(
      R.map(
        R.compose(
          createQuery(tagid),
          R.toString
        )
      )
    ),
    R.map(R.map(getUnixTime)),
    R.map(R.over(R.lensIndex(1), addMonths(1))),
    R.map(R.repeat(R.__, 2)),
    datexs
  )(monthsNum)
)

const noteslengthpermonth = q =>
  task(r => {
    let counta = 0
    db()
      .createKeyStream(q)
      .on('data', () => (counta = R.inc(counta)))
      .on('end', () => r.resolve(counta))
  })
const monthsnumber = () => differenceInMonths(startdate(), new Date())
const buildHistogram = R.compose(
  waitAll,
  R.map(noteslengthpermonth),
  createmonthqueries(monthsnumber()),
  R.nth(1),
  R.split(':'),
  R.prop('key')
)
// createmonthqueries('nbook1')(12)
const calcTimelines = R.converge(
  (histogramT, tag) =>
    histogramT.map(hist => R.assocPath(['value', 'timeline'], hist, tag)),
  [buildHistogram, R.identity]
)

const putTimelines = R.compose(
  batchT,
  R.map(R.assoc('type', 'put'))
)

const getTagsList = () =>
  task(r => {
    let tagxs = []
    db()
      .createReadStream({ gt: 'atag:', lt: 'atag:~' })
      .on('data', d => tagxs.push(d))
      .on('end', () => r.resolve(tagxs))
  })

const createTimelines = () =>
  getTagsList()
    .map(R.map(calcTimelines))
    .chain(waitAll)
    .chain(putTimelines)

module.exports = {
  createTimelines
}
