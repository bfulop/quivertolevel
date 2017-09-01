'use strict'
/* global describe, expect, before, it */

var expect = require('chai').expect
var td = require('testdouble')
var fileUtils = td.replace('./fileUtils')
const Task = require('data.task')
td
  .when(fileUtils.readFile('../config.json'))
  .thenReturn(new Task((rej, res) => res(JSON.stringify({ mongodb: 'foo' }))))
var subject = require('./index')

describe('testing replacing', function() {
  it('returns a task', function(done) {
    subject.getConfig.fork(console.error, t => {
      expect(t).to.eql('foo')
      done()
    })
  })
})
