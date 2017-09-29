'use strict'

var index = require('./index')

index.upload.fork(
  console.error,
  console.log
  )