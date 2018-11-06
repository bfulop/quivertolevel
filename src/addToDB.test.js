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
      res({ updated_at: 101 })
    }
  })
})
del.mockReturnValue(Promise.resolve('deleted'))
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
      value: { nbook: { name: 'nbookname' } }
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
      value: { nbook: {name: 'nbookname'}}
    })
  })
  test('inserts the note into its notebook, with its name as value', () => {
    expect(batch.mock.calls[0][0]).toContainEqual({
      type: 'put',
      key: 'anotebook:new_nbookid:003:noteid',
      value: 'nbookname'
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

describe('no need to update the notebook date', () => {
  beforeAll(done => {
    const simpleCase = {
      notekey: 'noteid',
      anotebookkey: 'anotebook:fresher_nbookid:100:noteid',
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

describe('have to update the notebook dates', () => {
  beforeAll(done => {
    const simpleCase = {
      notekey: 'note3id',
      anotebookkey: 'anotebook:older_nbookid:203:noteid',
      notebookkey: 'notebooks:203:older_nbookid',
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

  test('does update the sorted list of notebooks', () => {
    expect(batch.mock.calls[2][0]).toContainEqual({
      type: 'put',
      key: 'notebooks:203:older_nbookid',
      value: 0
    })
  })
  test('does update the update_value', () => {
    expect(batch.mock.calls[2][0]).toContainEqual({
      type: 'put',
      key: 'nobook:older_nbookid',
      value: { updated_at: '203' }
    })
  })
  test('deletes the older notebooks value', () => {
    expect(batch.mock.calls[2][0]).toContainEqual({
      type: 'del',
      key: 'notebooks:101:older_nbookid'
    })
  })
})
