const { of } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
var fileUtils = require('./utils/fileUtils')

const readFileCases = {
  'foo/meta.json': of(JSON.stringify({ shirts: 'pink' })),
  'foo/content.json': of(JSON.stringify({ shoes: 'white' }))
}
fileUtils.readFile.mockImplementation(v => readFileCases[v])

jest.mock('./addTags')
const { findTags } = require('./addTags')
findTags.mockReturnValue(of('processedNote'))

describe('processing a Note', () => {
  let launch
  beforeAll(done => {
    var subject = require('./processNote')
    launch = subject('foo').run()
    launch.listen({
      onResolved: () => done()
    })

  })
  test('calls addTags with all the data', () => {
    expect(findTags).toHaveBeenCalledWith({
      meta: { shirts: 'pink' },
      content: { shoes: 'white' }
    })
  })
  test('returns a single Task', () => {
      launch
      .listen({
        onResolved: t => {
          expect(t).toEqual('processedNote')
        }
      })
  })
})
