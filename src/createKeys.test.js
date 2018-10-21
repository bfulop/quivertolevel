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

test('creates the key for the note', function() {
  expect(subject).toHaveProperty('key', 'pantsid:123:shortsid')
})
test('copies the rest to the value', function() {
  expect(subject.value).toHaveProperty('nbook', expect.any(Object))
})
