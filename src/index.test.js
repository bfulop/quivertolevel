const { of } = require('folktale/concurrency/task')
const { List } = require('immutable-ext')

const _processedNoteBook = 'shorts'

jest.mock('./processFolders')
const processFolders = require('./processFolders')
processFolders.mockReturnValue(
  of(List.of(_processedNoteBook, _processedNoteBook))
)

jest.mock('./flattenNoteBook')
const flattenNoteBook = require('./flattenNoteBook')
var flattenNOteBookCases = {
  [_processedNoteBook]: of(List(['pants', 'pants']))
}
flattenNoteBook.mockImplementation(v => flattenNOteBookCases[v])

jest.mock('./createKeys')
const createKeys = require('./createKeys')
const createKeysCases = { pants: 'shoes' }
createKeys.mockImplementation(v => createKeysCases[v])

jest.mock('./addToDB')
const addToDB = require('./addToDB')
const addToDBCases = { shoes: of('success') }
addToDB.addNoteToDB.mockImplementation(v => addToDBCases[v])

var subject = require('./index')

test('gets back a list of notes to add', done => {
  subject()
    .run()
    .listen({
      onResolved: t => {
        expect(t).toEqual(['success', 'success', 'success', 'success'])
        done()
      }
    })
})
