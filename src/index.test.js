'use strict'

const Task = require('data.task')

describe('index', function () {
  var subject
  before('setting up stubs', function () {
    const notesData = 'anote'
    const folderDef = {
      meta: {
        name: 'pants',
        uuid: 'shorts'
      },
      notesData: [Task.of(notesData)]
    }
    const processedFolder = Task.of(folderDef)
    const processFolders = td.replace('./processFolders')
    processFolders.processFolders = Task.of([processedFolder])

    const { addNoteToMongo } = td.replace('./addToMongo')
    td
      .when(addNoteToMongo('shorts'))
      .thenReturn(Task.of('success'))

    subject = require('./index')
  })

  describe('adds notes to mongodb', function () {
    it('gets back a success', function () {
      subject.upload.fork(console.error, r => expect(r[0]).to.eql('success'))
    })
  })
})

// subject.upload = Task(List(Task))
