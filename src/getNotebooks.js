var fileUtils = require('./utils/fileUtils')
var getConfig = require('./getConfig').getConfig

const getNotebooks = getConfig
.chain(c => 
  fileUtils
  .readDir(c.quiverpath)
  .map(xs => xs.map(r => `${c.quiverpath}/${r}`))
  )

module.exports = { getNotebooks }
