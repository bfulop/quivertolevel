'use strict'
describe('getting the list of notebooks', function() {
  var subject

  before('set up stubs', function() {
    var Task = require('data.task')

    var getConfig = td.replace('./getConfig')

    getConfig.getConfig = Task.of({ quiverpath: 'foo' })

    var fileUtils = td.replace('./utils/fileUtils')
    td.when(fileUtils.readFile('foo/meta.json')).thenReturn(
      Task.of(
        JSON.stringify({
          children: [{ uuid: 'foodircontents' }, { uuid: 'bardircontents' }]
        })
      )
    )

    subject = require('./getNotebooks')
  })

  context('first run', function() {
    it('should be ok', function(done) {
      subject.getNotebooks.fork(console.error, t => {
        expect(t).to.eql(['foo/foodircontents', 'foo/bardircontents'])
        done()
      })
    })
  })
})
