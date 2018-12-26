const _flattenedNote = {
  nbook: {
    name: 'pants',
    uuid: 'pantsid'
  },
  note: {
    meta: {
      created_at: 123,
      tags: [],
      title: 'shorts',
      updated_at: 456,
      uuid: 'shortsid'
    },
    content: {
      pants: 'orange'
    }
  }
}
subject = require('./createKeys')(_flattenedNote)

test('adds the key for the note', function() {
  expect(subject).toHaveProperty('anotekey', 'anote:shortsid')
})
test('adds keys for listing notes in a notebook', function() {
  expect(subject).toHaveProperty('anotebookkey', 'anotebook:pantsid:123:shortsid')
})
test('adds key for listing notebooks', function() {
  expect(subject).toHaveProperty('notebookkey', 'notebooks:456:pantsid')
})
test('adds the complete note data', function() {
  expect(subject.value).toMatchObject(_flattenedNote)
})
