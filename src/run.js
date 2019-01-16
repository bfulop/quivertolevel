'use strict'

const fs = require('fs-extra')
const configT = require('./getconfig')

fs.remove('./quiverdb')
  .then(() => {
    console.log('quiverdb removed')
    require('./index')()
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
  })
  .catch(err => {
    console.error(err)
  })
