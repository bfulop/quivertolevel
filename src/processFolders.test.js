const { of } = require('folktale/concurrency/task')

jest.mock('./getNotebooks')
var getNotebooks = require('./getNotebooks')
jest.mock('./processANotebook')
var processANotebook = require('./processANotebook')

var _processedNoteBook = {
  meta: 'pants',
  notesData: [of({ shoes: 'socks' })]
}

processANotebook.mockReturnValue(of(_processedNoteBook))

getNotebooks.mockReturnValue(of(['nobook1', 'nobook2']))


test('processing folders', done => {
  var subject = require('./processFolders')
  subject()
    .run()
    .listen({
      onResolved: t => {
        expect(t.fold([])[0]).toEqual(_processedNoteBook)
        done()
      }
    })
})
