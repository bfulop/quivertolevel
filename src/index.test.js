'use strict'

const Task = require('data.task')
const { List } = require('immutable-ext')

describe('index', function () {
  var subject
  before('setting up stubs', function () {
    const processedFolder = 'shorts'
    const processFolders = td.replace('./processFolders')
    processFolders.processFolders = Task.of([processedFolder, processedFolder])

    const formatNoteData = td.replace('./formatNoteData')
    td
      .when(formatNoteData(processedFolder))
      .thenReturn(Task.of(List(['anote', 'anote'])))

    const { addNoteToMongo } = td.replace('./addToMongo')
    td.when(addNoteToMongo('anote')).thenReturn(Task.of('success'))

    subject = require('./index')
  })

  describe('adds notes to mongodb', function () {
    it('gets back a list of notes to add', function () {
      subject.upload.fork(console.error, t => {
        console.log(insp(t))
        expect(t).to.eql(['success', 'success', 'success', 'success'])
      })
    })
  })
})

// subject.upload = Task(List(Task))
