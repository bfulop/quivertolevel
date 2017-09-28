module.exports = function (wallaby) {
  return {
    files: [
      'src/*.js',
      { pattern: 'src/*.test.js', ignore: true },
      {
        pattern: 'src/utils/*.js',
        instrument: false,
        load: true,
        ignore: false
      }
    ],

    tests: ['src/*.test.js'],

    testFramework: 'mocha',

    env: {
      type: 'node'
    },

    // debug: true,

    setup: function (wallaby) {
      global.insp = f => (f && f.inspect ? f.inspect() : f)
      global.td = require('testdouble')
      global.expect = require('chai').expect
    }
  }
}
