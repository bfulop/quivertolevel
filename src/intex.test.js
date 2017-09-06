'use strict'

const Task = require('data.task')

describe('index', function () {
  var subject
  before('setting up stubs', function () {
    const processFolders = td.replace('./processFolders')
    const processedFolder = Task.of({
      meta: {
        name: 'pants',
        uuid: 'notebookid'
      },
      notesData: [Task.of({ blah: 'shoes' })]
    })
    processFolders.processFolders = Task.of([processedFolder])

    const { addNoteToMongo } = td.replace('./addToMongo')
    td
      .when(addNoteToMongo(td.matchers.anything()))
      .thenReturn(Task.of('success'))

    subject = require('./index')
  })

  describe('adds notes to mongodb', function () {
    it('gets back a success', function () {
      subject.upload.fork(console.error, t => t[0].fork(
        console.error,
        r => expect(r).to.eql('success'))
        )
    })
  })
})
