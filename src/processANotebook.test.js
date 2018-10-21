const { of } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')
jest.mock('./processNote')
var processNote = require('./processNote')

const readFileCases = {
  'nbook/meta.json': of(JSON.stringify({ stuff: 'foo' }))
}
fileUtils.readFile.mockImplementation(v => readFileCases[v])

const readDirCases = {
  nbook: of(['meta.json', 'note1', 'note2'])
}
fileUtils.readDir.mockImplementation(v => readDirCases[v])

const processNoteCases = {
  'nbook/note1': of({ pants: 'bar' })
}
processNote.mockImplementation(v => processNoteCases[v])

var subject = require('./processANotebook')

test('called with a notebook path', done => {
  subject('nbook')
    .run()
    .listen({
      onResolved: t => {
        expect(t.meta).toEqual({ stuff: 'foo' })
        done()
      }
    })
})

test('notesdatae', done => {
  subject('nbook')
    .run()
    .listen({
      onResolved: t => {
        t.notesData[0].run().listen({
          onResolved: r => {
            expect(t.meta).toEqual({ stuff: 'foo' })
            done()
          }
        })
      }
    })
})
