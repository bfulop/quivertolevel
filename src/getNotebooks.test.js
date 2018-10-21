const { of } = require('folktale/concurrency/task')
jest.mock('./utils/fileUtils')
let fileUtils = require('./utils/fileUtils')

const readFileTask = of(
  JSON.stringify({
    children: [{ uuid: 'foodircontents' }, { uuid: 'bardircontents' }]
  })
)
fileUtils.readFile.mockReturnValue(readFileTask)

jest.mock('./getconfig')
let getconfig = require('./getconfig')

const getconfigTask = of({ quiverpath: 'foo' })
getconfig.mockReturnValue(getconfigTask)

test('getting the list of notebooks', done => {
  var subject = require('./getNotebooks')
  subject()
    .run()
    .listen({
      onResolved: t => {
        expect(t).toEqual([
          'foo/foodircontents.qvnotebook',
          'foo/bardircontents.qvnotebook'
        ])
        done()
      }
    })
})
