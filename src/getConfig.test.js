const { task } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')

const readFileTask = task(resolver =>
  resolver.resolve(JSON.stringify({ foo: 'bar' }))
)
fileUtils.readFile.mockReturnValue(readFileTask)

test('should get the config', done => {
  var subject = require('./getConfig')
  subject.run().listen({
    onResolved: t => {
      expect(t).toEqual({ foo: 'bar' })
      done()
    }
  })
})
