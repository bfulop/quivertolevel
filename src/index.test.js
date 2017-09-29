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

    const flattenNoteBook = td.replace('./flattenNoteBook')
    td
      .when(flattenNoteBook(_processedNoteBook))
      .thenReturn(Task.of(List(['pants', 'pants'])))

    const createKeys = td.replace('./createKeys')
    td.when(createKeys('pants')).thenReturn('shoes')

    const addToDB = td.replace('./addToDB')
    td.when(addToDB.addNoteToDB('shoes')).thenReturn(Task.of('success'))

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
