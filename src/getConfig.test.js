var Task = require('data.task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')

test('should get the config', done => {
  const configfile = Task.of(JSON.stringify({ mongodb: 'foo' }))
  fileUtils.readFile.mockReturnValue(configfile)
  var subject = require('./getConfig')
  subject.getConfig.fork(console.error, t => {
    expect(t).toEqual({ mongodb: 'foo' })
    done()
  })
})
