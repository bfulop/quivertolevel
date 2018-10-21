const { of } = require('folktale/concurrency/task')

var _processedNoteBook = {
  meta: 'pants',
  notesData: [of('note1'), of('note2')]
}
var subject = require('./flattenNoteBook')

it('returns a Task containing a List of notes', function() {
  subject(_processedNoteBook)
    .run()
    .listen({
      onResolved: t => {
        expect(t.fold([])).toEqual([
          { nbook: 'pants', note: 'note1' },
          { nbook: 'pants', note: 'note2' }
        ])
      }
    })
})
