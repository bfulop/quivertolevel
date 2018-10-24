const { of } = require('folktale/concurrency/task')

const get = jest.fn()
const batch = jest.fn()
const del = jest.fn()

batch.mockReturnValue(Promise.resolve('inserted'))
get.mockImplementation(r => {
  return new Promise((res, rej) => {
    if (r === 'nobook:new_nbookid') {
      console.log('not found')
      rej('not found')
    } else {
      console.log('found')
      res('done')
    }
  })
})
const db = { get, batch, del }

jest.mock('levelup')
const levelup = require('levelup')
levelup.mockReturnValue(db)
jest.mock('./processANotebook')
var processANotebook = require('./processANotebook')

var subject = require('./addToDB').addNoteToDB

describe('simple case, new notebook to add', () => {
  beforeAll(done => {
    const simpleCase = {
      notekey: 'noteid',
      anotebookkey: 'anotebook:new_nbookid:003:noteid',
      notebookkey: 'notebooks:112:new_nbookid',
      value: 'hats'
    }
    subject(simpleCase)
      .run()
      .listen({
        onResolved: t => {
          done()
          return t
        }
      })
  })

  test('inserts the note', () => {
    expect(batch.mock.calls[0][0]).toContainEqual({
      type: 'put',
      key: 'noteid',
      value: 'hats'
    })
  })
  test('inserts the note into its notebook', () => {
    expect(batch.mock.calls[0][0]).toContainEqual({
      type: 'put',
      key: 'anotebook:new_nbookid:003:noteid',
      value: 0
    })
  })
  test('inserts notebook into the sorted list', () => {
    expect(batch.mock.calls[0][0]).toContainEqual({
      type: 'put',
      key: 'notebooks:112:new_nbookid',
      value: 0
    })
  })
  test('saves the latest update date for the notebook', () => {
    expect(batch.mock.calls[0][0]).toContainEqual({
      type: 'put',
      key: 'nobook:new_nbookid',
      value: { updated_at: '112' }
    })
  })
})


describe('notebook updated_at value is later', () => {
  beforeAll(done => {
    const simpleCase = {
      notekey: 'noteid',
      anotebookkey: 'anotebook:fresher_nbookid:003:noteid',
      notebookkey: 'notebooks:100:fresher_nbookid',
      value: 'hats'
    }
    subject(simpleCase)
      .run()
      .listen({
        onResolved: t => {
          done()
          return t
        }
      })
  })

  test('doesn NOT update the sorted list of notebooks', () => {
    expect(batch.mock.calls[1][0]).not.toContainEqual({
      type: 'put',
      key: 'notebooks:100:fresher_nbookid',
      value: 0
    })
  })
  test('does NOT updates the update_value', () => {
    expect(batch.mock.calls[1][0]).not.toContainEqual({
      type: 'put',
      key: 'nobook:fresher_nbookid',
      value: { updated_at: 100 }
    })
  })
})
