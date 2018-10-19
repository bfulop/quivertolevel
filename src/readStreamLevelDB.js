const levelup = require('levelup')
const leveldown = require('leveldown')

const db = levelup('./testdb', { db: leveldown })

let counta = 0

db.createKeyStream()
  .on('data', function (data) {
    counta ++
    console.log(data)
  })
  .on('error', function (err) {
    console.log('Oh my!', err)
  })
  .on('close', function () {
    console.log('Stream closed', counta, 'notes found')
  })
  .on('end', function () {
    console.log('Stream ended')
  })