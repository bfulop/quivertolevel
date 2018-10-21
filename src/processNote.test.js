const { of } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')

const readFileCases = {
  'foo/meta.json': of(JSON.stringify({ shirts: 'pink' })),
  'foo/content.json': of(JSON.stringify({ shoes: 'white' }))
}
fileUtils.readFile.mockImplementation(v => readFileCases[v])

test('returns a single Task', done => {
  var subject = require('./processNote')
  subject('foo')
    .run()
    .listen({
      onResolved: t => {
        expect(t).toEqual({
          meta: { shirts: 'pink' },
          content: { shoes: 'white' }
        })
        done()
      }
    })
})
