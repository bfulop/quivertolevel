'use strict'

const Task = require('data.task')
const { List } = require('immutable-ext')

describe('flattendeep', function () {
  var subject, deepstuff
  before('test setup', function () {
    subject = require('./formatNoteData')

    const folderDef = {
      meta: 'pants',
      notesData: [Task.of('success1'), Task.of('success1')]

    }
    const processedFolder = Task.of(folderDef)
    deepstuff = [processedFolder]
  })

  it('flattens the deep structure', function () {
    subject(deepstuff).map(r => r.fork(console.error,
      t => {
        console.log(insp(r))
        console.log(insp(t))
        expect(t.fold([])).to.eql(['pantssuccess1', 'pantssuccess1'])
      }
      ))
  })
})
