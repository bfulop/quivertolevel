const { of } = require('folktale/concurrency/task')

const get = jest.fn()
get.mockImplementation(r => {
  return new Promise((res, rej) => {
    switch (r) {
      case 'tag003':
        res({
          notes: ['anote001'],
          siblings: []
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
  test('puts new tag', () =>{
    expect(result).toContainEqual({
      type: 'put',
      key: 'tags:tag001',
      value: {
        notes: ['note001'],
        siblings: []
      }
    })
  })
})
