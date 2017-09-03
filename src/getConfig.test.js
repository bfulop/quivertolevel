'use strict'
/* global context, expect, before, it */

var expect = require('chai').expect
var td = require('testdouble')
var Task = require('data.task')

var fileUtils = td.replace('./utils/fileUtils')
td
  .when(fileUtils.readFile('../config.json'))
  .thenReturn(
    new Task((rej, res) => res(JSON.stringify({ mongodb: 'foo' }))),
    'foo'
    )
  // .thenReturn(
  //   new Task((rej, res) => res('foo'))
  //   )

var subject = require('./getConfig')

context('first run', function() {
  it('should be ok', function(done) {
    subject.getConfig.fork(console.error, t => {
      expect(t).to.eql('foo')
      done()
    })
  })
})

