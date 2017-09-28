'use strict'

const Task = require('data.task')

describe('flattendeep', function () {
  var subject, _processedNoteBook

  afterEach(function () {
    td.reset()
  })

  before('test setup', function () {
    _processedNoteBook = {
      meta: 'pants',
      notesData: [Task.of('note1'), Task.of('note2')]
    }
    subject = require('./formatNoteData')(_processedNoteBook)
  })

  it('returns a Task containing a List of notes', function () {
    console.log(insp(subject))
    subject.fork(console.error, t => {
      console.log(insp(t))
      expect(t.fold([])).to.eql([
        { nbook: 'pants', note: 'note1' },
        { nbook: 'pants', note: 'note2' }
      ])
    })
  })
})
