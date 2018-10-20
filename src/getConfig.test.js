const { task } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')

test('should get the config', done => {
  const readFileTask = task(resolver =>
    resolver.resolve(JSON.stringify({ foo: 'bar' }))
  )
  fileUtils.readFile.mockReturnValue(readFileTask)

  var subject = require('./getConfig')
  subject.getConfig.run().listen({
    onResolved: t => {
      expect(t).toEqual({ foo: 'bar' })
      done()
    }
  })
})
