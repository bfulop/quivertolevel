const R = require('ramda')
const { of } = require('folktale/concurrency/task')

const tag001data = {
  notes: ['pants1', 'pants2', 'pants3', 'pants4', 'pants5', 'pants6'],
  hats: 'shoes',
  siblings: {
    tag002: { count: 1, child: false },
    tag003: { count: 3, child: false }
  }
}

const tag002data = {
  notes: ['pants1', 'pants2', 'pants3', 'pants4'],
  siblings: {
    tag001: { count: 1, child: false }
  }
}

const tag003data = {
  notes: ['pants1', 'pants2', 'pants3', 'pants4'],
  siblings: {
    tag001: { count: 3, child: false }
  }
}

const get = jest.fn()
get.mockImplementation(r => {
  return new Promise((res, rej) => {
    switch (r) {
      case 'tags:tag001':
        res(tag001data)
        break
      case 'tags:tag002':
        res(tag002data)
        break
      case 'tags:tag003':
        res(tag003data)
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

const subject = require('./tagsRelations')

describe('processing tag001', () => {
  let result
  beforeAll(done => {
    subject
      .processRelations(['tags:tag001'])
      .run()
      .future()
      .map(r => {
        result = r
        done()
      })
  })
  test('complete tag data is preserved', () => {
    expect(result[0]).toMatchObject({ value: { hats: 'shoes' } })
  })
  test('child property updated', () => {
    expect(result[0]).toMatchObject({
      value: { siblings: { tag002: { child: true } } }
    })
  })
  test('calculates child ratio', () => {
    expect(result[0]).toMatchObject({
      value: { parentratio: 2 }
    })
  })
  test('adds leveldb instruction', () => {
    expect(result[0]).toMatchObject({
      type: 'put',
      key: 'tags:tag001'
    })
  })
})
