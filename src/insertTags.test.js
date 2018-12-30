const { of } = require('folktale/concurrency/task')

const get = jest.fn()
get.mockImplementation(r => Promise.resolve('gotit'))
const db = { get }

jest.mock('levelup')
const levelup = require('levelup')
levelup.mockReturnValue(db)

const subject = require('./insertTags')

describe('simple case, new tag to add', () => {
  test('returns from the db', done => {
    const simpleCase = 'blah'
    subject(simpleCase)
      .run()
      .listen({
        onResolved: t => {
          done()
          expect(t).toEqual('gotit')
          return t
        }
      })
  })
})
