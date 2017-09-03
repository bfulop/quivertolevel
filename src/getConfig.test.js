'use strict'

var Task = require('data.task')

var fileUtils = td.replace('./utils/fileUtils')
td
  .when(fileUtils.readFile('../config.json'))
  .thenReturn(
    Task.of(JSON.stringify({ mongodb: 'foo' }))
  )

var subject = require('./getConfig')

context('first run', function () {
  it('should be ok', function (done) {
    subject.getConfig.fork(console.error, t => {
      expect(t).to.eql({ mongodb: 'foo' })
      done()
    })
  })
})
