'use strict'

describe('processing a list of notebooks', function () {
  var subject

  before('set up stubs', function () {
    var Task = require('data.task')

    var getNotebooks = td.replace('./getNotebooks')
    getNotebooks.getNotebooks = Task.of(['nobook1', 'nobook2'])

    var processANotebook = td.replace('./processANotebook')

    td
    .when(processANotebook.processANotebook(td.matchers.isA(String)))
    .thenReturn(Task.of('processed'))

    subject = require('./processFolders')
  })

  describe('processes a list', function () {
    it('returns a list of tasks', function () {
      subject.processFolders.fork(
        console.err,
        r => r[0].fork(
          console.err,
          t => expect(t).to.eql('processed')
          )
        )
    })
  })
})
