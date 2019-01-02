const R = require('ramda')
const { of } = require('folktale/concurrency/task')

const get = jest.fn()
get.mockImplementation(r => {
  return new Promise((res, rej) => {
    switch (r) {
      case 'tags:tag003':
        res({
          notes: ['somenote'],
          siblings: {
            sometag: { count: 1, child: false },
            existingtag: { count: 4, child: false }
          }
        })
        break
      default:
        rej('not fond')
    }
  })
})
const db = { get }

jest.mock('levelup')
const levelup = require('levelup')
levelup.mockReturnValue(db)

jest.mock('./utils/db')
const getDb = require('./utils/db')
getDb.mockReturnValue(db)

const subject = require('./insertTags')

describe('simple case, new tag to add', () => {
  let result
  const note1 = {
    shoes: 'hats',
    key: 'anote:note001',
    value: {
      shorts: 'pants',
      note: {
        meta: {
          tags: ['tag001', 'tag002'],
          socks: 'shirts'
        },
        gloves: 'sandals'
      }
    }
  }
  const otherstuff = { hats: 'pants' }
  beforeAll(done => {
    const simpleCase = [note1, otherstuff]
    subject(simpleCase)
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('contains the original element', () => {
    expect(result).toContain(note1)
  })
  test('contains unimportant elements', () => {
    expect(result).toContain(otherstuff)
  })
  test('puts new tag', () => {
    let r = R.find(R.propEq('key', 'tags:tag001'), result)
    expect(r).toMatchObject({
      type: 'put',
      key: 'tags:tag001'
    })
    expect(r).toMatchObject({
      value: {
        notes: ['note001'],
        siblings: { tag002: { count: 1, child: false } }
      }
    })

    // expect(result).toContainEqual({
    //   type: 'put',
    //   key: 'tags:tag001',
    // })
  })
})
describe('updates existing tag', () => {
  let result
  const note2 = {
    key: 'anote:note002',
    value: {
      note: {
        meta: {
          tags: ['tag003', 'tag004', 'existingtag']
        }
      }
    }
  }
  beforeAll(done => {
    const simpleCase = [note2]
    subject(simpleCase)
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('updates tag', () => {
    let r = R.find(R.propEq('key', 'tags:tag003'), result)
    expect(r).toMatchObject({
      value: {
        notes: ['somenote', 'note002'],
        siblings: {
          tag004: { count: 1, child: false },
          sometag: { count: 1, child: false },
          existingtag: { count: 5, child: false}
        }
      }
    })
  })
})
