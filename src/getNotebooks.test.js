const { task } = require('folktale/concurrency/task')
jest.mock('./getConfig')
var getConfig = require('./getConfig')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')


console.log('mocked normally')
test('getting the list of notebooks', done => {
  const getConfigTask = task(resolver =>
    resolver.resolve({ quiverpath: 'foo' })
  )
  getConfig.mockReturnValue(getConfigTask)

  const readFileTask = task(resolver =>
    resolver.resolve(
      JSON.stringify({
        children: [{ uuid: 'foodircontents' }, { uuid: 'bardircontents' }]
      })
    )
  )
  fileUtils.readFile.mockReturnValue(readFileTask)

  // ***********************

  var subject = require('./getNotebooks')
  subject.run().listen({
    onResolved: t => {
      expect(t).to.eql(['foo/foodircontents', 'foo/bardircontents'])
      done()
    }
  })
})
