const R = require('ramda')
const { of } = require('folktale/concurrency/task')
const levelup = require('levelup')
const memdown = require('memdown')
const encode = require('encoding-down')

const db = levelup(encode(memdown(), { valueEncoding: 'json' }))

// seed some data
const data = [
  // 30 sept 2015
  // 1443650400
  { type: 'put', key: 'tagsnotes:tag001:notes:1443622857:note001', value: 'pants' },
  // 1 oct 2015
  { type: 'put', key: 'tagsnotes:tag001:notes:1441228402:note001', value: 'pants' },
  // 15 oct 2015
  { type: 'put', key: 'tagsnotes:tag001:notes:1444867200:note001', value: 'pants' },

  { type: 'put', key: 'atag:tag001', value: {pants: 'shoes'} },
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

const subject = require('./tagTimeline')

describe('adds timeline for each tag', () => {
  let result
  beforeAll(done => {
    subject
      .createTimelines()
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('added the timeline property', () => {
      return expect(db.get('atag:tag001')).resolves.toMatchObject({
        timeline: expect.arrayContaining([2,1,0])
      })
  })
})
