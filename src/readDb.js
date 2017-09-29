'use strict'

const levelup = require('levelup')
const leveldown = require('leveldown')

const db = levelup('./testdb', { db: leveldown, valueEncoding: 'json' })

const key = 'D28110CD-8E97-42B0-BECE-A691239BE5E6:1495837273:00F543BD-B912-4A05-BA6A-ED6ECCD6E87F'

db.get(key, function (err, value) {
    if (err) return console.log('Ooops!', err) // likely the key was not found

    // ta da!
    console.log('value', value)
  })