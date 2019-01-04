'use strict'

var index = require('./tagsRelations').calcRelations

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
