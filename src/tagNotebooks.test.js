const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const memdown = require('memdown')
const encode = require('encoding-down')

const db = levelup(encode(memdown(), { valueEncoding: 'json' }))

// seed some data
const data = [
  { type: 'put', key: 'tagsnotebooks:tag001:notebooks:nbook001:notes:note001', value: 'pants' },
  { type: 'put', key: 'tagsnotebooks:tag001:notebooks:nbook001:notes:note002', value: 'pants' },
  { type: 'put', key: 'tagsnotebooks:tag001:notebooks:nbook001:notes:note003', value: 'pants' },

  { type: 'put', key: 'tagsnotebooks:tag001:notebooks:nbook002:notes:note007', value: 'pants' },
  { type: 'put', key: 'tagsnotebooks:tag002:notebooks:nbook002:notes:note007', value: 'pants' },

  { type: 'put', key: 'anotebook:nbook001:123:note001', value: 'shorts'},
  { type: 'put', key: 'anotebook:nbook001:124:note002', value: 'shorts'},
  { type: 'put', key: 'anotebook:nbook001:125:note003', value: 'shorts'},
  { type: 'put', key: 'anotebook:nbook001:126:note004', value: 'shorts'},
  { type: 'put', key: 'anotebook:nbook001:127:note005', value: 'shorts'},
  { type: 'put', key: 'anotebook:nbook001:128:note006', value: 'shorts'},

  { type: 'put', key: 'anotebook:nbook002:129:note007', value: 'shorts'},
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

const subject = require('./tagNotebooks')

describe('collects individual notebooks', () => {
  let result
  beforeAll(done => {
    subject
      .summarizeNotebooks()
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('collects the notebooks', () => {
   return expect(result).toMatchObject({tag001: {nbook001: {count: 3}}})
  })
})
describe('inserts notebook total size', () => {
  let result
  beforeAll(done => {
    subject
      .importNotebookSizes({tag001: {nbook001: {count: 3}}, tag002: {nbook001: {count: 3}}})
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('added size of notebook', () => {
    return expect(result).toContainEqual({tag001: {nbook001: {count: 3, size: 6}}})
  })
})
describe('list notebooks by tags', () => {
  let result
  beforeAll(done => {
    subject
      .processNotebooks()
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  describe('list single notebooks by tag', () => {
    test('inserts notebookid ordered by percentage (ascending, inverse)', () => {
      return expect(db.get('atagnotebook:tag001:50:nbook001')).resolves.toMatchObject({ count: 3 })
    })
  })
})
