'use strict'

describe('flattendeep', function () {
  const subject = require('./flattenDeep')

  it('flattens the deep structure', function () {
    subject.fork(console.error, r => expect(r[0]).to.eql('pantssuccess1'))
  })
})
