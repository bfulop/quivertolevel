const { of } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')

const readFileTask = of(JSON.stringify({ foo: 'aar' }))
fileUtils.readFile.mockReturnValue(readFileTask)

test('should get the config', done => {
  var subject = require('./getconfig')
  subject()
    .run()
    .listen({
      onResolved: t => {
        expect(t).toEqual({ foo: 'aar' })
        done()
      }
    })
})
