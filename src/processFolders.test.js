'use strict'

describe('processing a list of notebooks', function () {
  var subject, _processedNoteBook

  afterEach(function () {
    td.reset()
  })

  before('set up stubs', function () {
    var Task = require('data.task')

    var getNotebooks = td.replace('./getNotebooks')
    getNotebooks.getNotebooks = Task.of(['nobook1', 'nobook2'])

    var processANotebook = td.replace('./processANotebook')
    
    _processedNoteBook = {
      meta: 'pants',
      notesData: [Task.of({ shoes: 'socks' })]
    }

    td
      .when(processANotebook.processANotebook(td.matchers.isA(String)))
      .thenReturn(Task.of(_processedNoteBook))

    subject = require('./processFolders')
  })

  describe('processing folders', function () {
    it('returns a Task containing a List', function () {
      subject.processFolders.fork(console.err, r => {
        expect(r.fold([])[0]).to.eql(_processedNoteBook)
      })
    })
  })
})
