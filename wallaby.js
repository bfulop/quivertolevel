module.exports = function (wallaby) {
  return {
    files: [
      'src/getConfig.js',
      { pattern: 'src/utils/*.js', instrument: false, load: true, ignore: false }
    ],

    tests: [
      'src/*.test.js'
    ],

    testFramework: 'mocha',

    env: {
      type: 'node'
    }

  }
}
