var fileUtils = require('./utils/fileUtils')
var getconfig = require('./getconfig')
var R = require('ramda')

const getNotebooks = () => {
  return getconfig().chain(c =>
    fileUtils
      .readFile(`${c.quiverpath}/meta.json`)
      .map(JSON.parse)
      .map(R.prop('children'))
      .map(xs => xs.map(r => `${c.quiverpath}/${R.prop('uuid', r)}.qvnotebook`))
  )
}

module.exports = getNotebooks
