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
    it('returns a single task', function () {
      subject.processFolders.fork(
        console.error,
        t => {
          expect(t).to.eql(['processed', 'processed'])
        }
        )
    })
  })
})
