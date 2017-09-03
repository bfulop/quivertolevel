var fileUtils = require('./utils/fileUtils')
var getConfig = require('./getConfig').getConfig


const getNotebooks = getConfig
.chain(c => fileUtils.readDir(c.quiverpath))
.map(c => c /* ? insp(c) */)


module.exports = { getNotebooks }
