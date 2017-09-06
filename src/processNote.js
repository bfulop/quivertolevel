'use strict'

const Task = require('data.task')

const processNote = r => Task.of({ note: 'foo' })

module.exports = { processNote }
