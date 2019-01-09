'use strict'

const fs = require('fs-extra')
const configT = require('./getconfig')
var index = require('./index')

fs.removeSync('../quiverdb')
console.log('removed quiverdb')

index()
  .run()
  .listen({
    onResolved: r => {
      console.log('successfully imported')
      return r
    },
    onRejected: r => {
      console.error('error importing')
      console.error(r)
      return r
    }
  })
