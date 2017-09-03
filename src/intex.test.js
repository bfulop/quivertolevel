// describe.skip('index app', function () {
//   var subject, getConfig, Task
//   before('setting up', function () {
//     subject = require('./index')
//     Task = require('data.task')
//     getConfig = td.replace('./getConfig')
//     td.when(getConfig.fork(td.matchers.isA(Function), td.matchers.isA(Function))).thenReturn(Task.of('foo'))
//   })

//   describe('loads the config', function () {
//     it('loaded the conf', function (done) {
//       subject.loadConfig().map(t => {
//         expect(t).to.eql('foo')
//         done()
//       })
//   })
// })
