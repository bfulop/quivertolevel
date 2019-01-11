const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const memdown = require('memdown')
const encode = require('encoding-down')

const db = levelup(encode(memdown(), { valueEncoding: 'json' }))


// seed some data
const data = [
  { type: 'put', key: 'tagsnotes:atag1:notes:123:note001', value: 'pants' },
  { type: 'put', key: 'tagsnotes:atag1:notes:124:note002', value: 'pants' },
  { type: 'put', key: 'tagsnotes:atag1:notes:125:note003', value: 'pants' },
  { type: 'put', key: 'tagsnotes:atag1:notes:126:note004', value: 'pants' },
  { type: 'put', key: 'tagsnotes:atag2:notes:123:note001', value: 'pants' },
  { type: 'put', key: 'tagsnotes:atag2:notes:124:note002', value: 'pants' },
  { type: 'put', key: 'tagsiblings:atag1:atag2:note001', value: 'pants' },
  { type: 'put', key: 'tagsiblings:atag1:atag2:note002', value: 'pants' },
  { type: 'put', key: 'tagsiblings:atag2:atag1:note001', value: 'pants' },
  { type: 'put', key: 'tagsiblings:atag2:atag1:note002', value: 'pants' },
]
db.batch(data, err => {
  if (err) {
    console.log('Ooops!', err)
  } else {
    console.log('data seeded')
  }

})

jest.mock('./utils/db')
const getDb = require('./utils/db')
getDb.mockReturnValue(db)

const subject = require('./tagsRelations')

describe('summarising the tags', () => {
  let result
  beforeAll(done => {
    subject
      .processTags()
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('adds the unique tag record', () => {
    return expect(db.get('atag:atag1')).resolves.toMatchObject({count: 4})
  })
  test('adds the unique tag record (atag2)', () => {
    return expect(db.get('atag:atag2')).resolves.toMatchObject({count: 2})
  })
  test('collects sibling', () => {
    return expect(db.get('atagsibling:atag1:atag2')).resolves.toMatchObject({count: 2})
  })
  test('collects sibling (atag2)', () => {
    return expect(db.get('atagsibling:atag2:atag1')).resolves.toMatchObject({count: 2})
  })
  test('calculates ratios (total number of notes / sibling tag count)', () => {
    return expect(db.get('atagsibling:atag1:atag2')).resolves.toMatchObject({ratio: 2})
  })
  test('sibling ratio (atag2)', () => {
    return expect(db.get('atagsibling:atag2:atag1')).resolves.toMatchObject({ratio: 1})
  })
  test('saves child ratio', () => {
    return expect(db.get('atagsibling:atag1:atag2')).resolves.toMatchObject({childratio: 1})
  })
  test('sets "child" state', () => {
    return expect(db.get('atagsibling:atag1:atag2')).resolves.toMatchObject({child: false})
  })
})
