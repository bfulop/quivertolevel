'use strict'

const Task = require('data.task')

describe('processing a notebook', function () {
  var subject

  afterEach(function () {
    td.reset()
  })

  before('set up reading meta', function () {
    var fileUtils = td.replace('./utils/fileUtils')
    td
      .when(fileUtils.readFile('nbook/meta.json'))
      .thenReturn(Task.of(JSON.stringify({ stuff: 'foo' })))
    
    td.when(fileUtils.readDir('nbook'))
    .thenReturn(Task.of(['note1', 'note2']))

    var processNote = td.replace('./processNote').processNote
    td.when(processNote('nbook/note1'))
    .thenReturn(Task.of({ pants: 'bar' }))

    subject = require('./processANotebook')
  })

  describe('called with a notebook path', function () {
    it('returns a Task with the metadata', function (done) {
      subject.processANotebook('nbook').fork(
        console.error,
        t => {
          expect(t.meta).to.eql({ stuff: 'foo' })
          done()
        }
        )
    })
    it('notesData is an array of Tasks of notes', function (done) {
      subject.processANotebook('nbook').fork(
        console.error,
        t => t.notesData[0].fork(
          console.error,
          r => { 
            expect(r).to.eql({ pants: 'bar' }) 
            done()
          }
          )
        )
    })
  })
})
