const R = require('ramda')
const { of } = require('folktale/concurrency/task')

const get = jest.fn()
get.mockImplementation(r => {
  return new Promise((res, rej) => {
    switch (r) {
      case 'tags:tag003':
        res({
          notes: [{ id: 'somenote' }],
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
  const note1 = {
    shoes: 'hats',
    key: 'anote:note001',
    value: {
      shorts: 'pants',
      nbook: {
        uuid: 'nbook001',
        stuff: 'pants'
      },
      note: {
        meta: {
          tags: ['tag001', 'tag002'],
          socks: 'shirts',
          created_at: 123,
          uuid: 'note001'
        },
        gloves: 'sandals'
      }
    }
  }
  const otherstuff = { hats: 'pants' }
  const simpleCase = [note1, otherstuff]
  test('contains the original element', () => {
    expect(subject(simpleCase)).toContain(note1)
  })
  test('contains unimportant elements', () => {
    expect(subject(simpleCase)).toContain(otherstuff)
  })
  test('lists notes and tags tagsnotes:tagsuuid:notes:notedate:noteuuid', () => {
    let result = subject(simpleCase)
    let putCommand = R.find(
      R.propEq('key', 'tagsnotes:tag001:notes:123:note001'),
      result
    )
    expect(putCommand).toMatchObject({
      type: 'put'
    })
    expect(putCommand.value).toMatchObject({ meta: { socks: 'shirts' } })
  })
  test('adds sibling info', () => {
    let result = subject(simpleCase)
    let putCommand = R.find(
      R.propEq('key', 'tagsiblings:tag001:siblings:tag002:note001'),
      result
    )
    expect(putCommand).toMatchObject({
      type: 'put'
    })
  })
  test('list the notebooks', () => {
    let result = subject(simpleCase)
    let putCommand = R.find(
      R.propEq('key', 'tagsnotebooks:tag001:notebooks:nbook001:notes:note001'),
      result
    )
    expect(putCommand).toMatchObject({
      type: 'put'
    })
  })
})
