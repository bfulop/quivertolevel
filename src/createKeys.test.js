'use strict'

const Task = require('data.task')
const { List } = require('immutable-ext')

describe('createKeys', function () {
  var subject
  afterEach(function () {
    td.reset()
  })

  before('setting up stubs', function () {
    const _flattenedNote = {
      nbook: {
        name: 'pants',
        uuid: 'pantsid'
      },
      note: {
        meta: {
          created_at: 123,
          tags: [],
          title: 'shorts',
          updated_at: 456,
          uuid: 'shortsid'
        },
        contents: {
          pants: 'orange'
        }
      }
    }
    subject = require('./createKeys')(_flattenedNote)
  })

  it('creates the key for the note', function () {
    expect(subject).to.include({
      key: 'pantsid:123:shortsid'
    })
  })
  it('copies the rest to the value', function () {
    console.log(subject)
    expect(subject.value).to.have.property('nbook')
  })
})
