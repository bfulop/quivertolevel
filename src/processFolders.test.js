var Task = require('data.task')

jest.mock('./getNotebooks')
var getNotebooks = require('./getNotebooks')
jest.mock('./processANotebook')
var processANotebook = require('./processANotebook')

  console.log('starst')

var _processedNoteBook = {
  meta: 'pants',
  notesData: [Task.of({ shoes: 'socks' })]
}

processANotebook.processANotebook.mockReturnValue(Task.of(_processedNoteBook))

// getNotebooks.getNotebooks = Task.of(['nobook1', 'nobook2'])
// getNotebooks.getNotebooks.map.mockReturnValue(Task.of(['nobook1', 'nobook2'])) 
getNotebooks.getNotebooks = new Task((rej, res) => {
  res(['nobook1', 'nobook2'])
})

var subject = require('./processFolders')

test('processing folders', done => {
  subject.processFolders.fork(console.err, r => {
    console.log('hono', r)
    expect(r.fold([])[0]).to.eql(_processedNoteBook)
    done()
  })
})
