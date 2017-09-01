'use strict'

/* global expect, describe, it */
var expect = require('chai').expect
var subject = require('./fileUtils')

it('Task test', (done) => {
  subject.testTask('hello').fork(
    console.error,
    t => {
      expect(t).to.eql('hello')
      done()
    }
    )
})
