'use strict'

const Task = require('data.task')
const { List } = require('immutable-ext')

describe('index', function () {
  var subject

  afterEach(function () {
    td.reset()
  })

  before('setting up stubs', function () {
    const _processedNoteBook = 'shorts'
    const processFolders = td.replace('./processFolders')
    processFolders.processFolders = Task.of(
      List.of(_processedNoteBook, _processedNoteBook)
    )

    const formatNoteData = td.replace('./formatNoteData')
    td
      .when(formatNoteData(_processedNoteBook))
      .thenReturn(Task.of(List(['anote', 'anote'])))

    const addToDB = td.replace('./addToDB')
    td.when(addToDB.addNoteToDB('anote')).thenReturn(Task.of('success'))
    td
      .when(addToDB.addNoteBookToDB(List(['anote', 'anote', 'anote', 'anote'])))
      .thenReturn(Task.of('notebook added'))

    subject = require('./index')
  })

  describe('adds notes to mongodb', function () {
    it('gets back a list of notes to add', function () {
      subject.upload.fork(console.error, t => {
        console.log(insp(t))
        expect(t).to.eql(['success', 'success', 'success', 'success' ])
      })
    })
  })
})

// subject.upload = Task(List(Task))
