const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const getConfig = require('./getconfig')

const logger = r => {
  console.log(r)
  return r
}

const calcProp = (p, f) =>
  R.ap(
    R.compose(
      R.assoc(p),
      f
    ),
    R.identity
  )
const calcPropR = R.curry(calcProp)
const sometext = {
  data: 'pants blah3 shoes tag1 blah',
  tags: []
}
const content = [
  sometext,
  {
    data: 'relatedtg4 none nothing anything'
  }
]
const config = {
  dictionary: [
    { name: 'tag1', related: ['blah', 'foo'] },
    { name: 'tag2', related: ['blah2', 'foo2'] },
    { name: 'tag3', related: ['blah3', 'foo3'] },
    { name: 'tag4', related: ['relatedtg4'] },
    { name: 'tag5', related: ['relatedtg5'] }
  ]
}

const nameLens = R.lensProp('name')
const intoArray = R.append(R.__, [])
const converttoRegex = t => new RegExp('(\\s+|^)' + t + '(\\s+|$)')
const mergenames = R.compose(
  R.map(converttoRegex),
  R.flatten,
  R.values,
  R.over(nameLens, intoArray)
)
const addmerged = calcPropR('merged', mergenames)
const containsTxt = txt => R.test(R.__, txt)

const mergeTagname = R.converge(
    (t, dictitem) => R.over(R.lensProp('related'), R.append(t), dictitem),
    [
      R.prop('name'),
      R.identity
    ]
  )
const containsWord = R.curry((word, dictitem) => R.contains(word, dictitem))
const getDictionaryTag = R.curry((dict, word) => R.compose(
  R.map(R.prop('name')),
  R.filter(R.compose(R.contains(word), R.prop('related'))),
  R.map(mergeTagname)
)(dict))
const testlist = txt => R.any(containsTxt(txt))
const testline = txt =>
  R.compose(
    testlist(txt),
    R.view(R.lensProp('merged')),
    addmerged
  )
const getTags = txtblock =>
  R.compose(
    R.map(R.prop('name')),
    R.filter(testline(txtblock.data))
  )
const getTagsC = R.curry((dict, txtblock) => getTags(txtblock)(dict))
const addTags = dict =>
  R.converge(R.assoc('tags'), [getTagsC(dict), R.identity])
const addAllTags = dict => R.map(addTags(dict))
const getAllTags = dict =>
  R.compose(
    R.uniq,
    R.flatten,
    R.map(R.view(R.lensProp('tags'))),
    addAllTags(dict)
  )

const concatAll_ = R.unapply(R.reduce(R.concat, []))
const getTagsEveryWhere = dict =>
  R.converge(concatAll_, [
    R.compose(
      R.flatten,
      R.map(getDictionaryTag(dict)),
      R.view(R.lensPath(['meta', 'tags']))
    ),
    R.compose(
      getTagsC(dict),
      R.objOf('data'),
      R.path(['content', 'title'])
    ),
    R.compose(
      getAllTags(dict),
      R.path(['content', 'cells'])
    )
  ])
const collectTags = dict =>
  R.converge(R.set(R.lensPath(['meta', 'tags'])), [
    getTagsEveryWhere(dict),
    R.identity
  ])

const findTags = r => getConfig().map(c => collectTags(c.dictionary)(r))

module.exports = { findTags }
