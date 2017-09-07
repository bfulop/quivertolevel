'use strict'

const Task = require('data.task')

describe('flattendeep', function () {
  var subject, deepstuff
  before('test setup', function () {
    subject = require('./formatNoteData')

    const notesData = 'success1'
    const Res = {
      meta: 'pants',
      notesData: [Task.of(notesData), Task.of(notesData)]

    }

    deepstuff = Task.of([Task.of(Res), Task.of(Res)])
  })

  it('flattens the deep structure', function () {
    subject(deepstuff).fork(console.error, r => expect(r[0]).to.eql('pantssuccess1'))
  })
})
