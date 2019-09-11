const path = require('path')
const Angel = require('organic-angel')
const angel = new Angel()
const test = require('ava')
angel.cells_root = path.join(__dirname, 'test-monorepo')
require('../index')(angel)

test.cb('cells -- :cmd', (t) => {
  t.timeout(64 * 1000)
  angel.do('cells -- npm install', t.end)
})

test.cb('cell :cellName -- :cmd', (t) => {
  t.timeout(64 * 1000)
  angel.do('cell api -- npm install', t.end)
})

test.cb('cells :groupName -- :cmd', (t) => {
  t.timeout(64 * 1000)
  angel.do('cells backend -- npm install', t.end)
})

test.cb('(multi-group) cells :groupName -- :cmd', (t) => {
  t.timeout(64 * 1000)
  angel.do('cells test -- npm install', t.end)
})

test.cb('failing grecefully cells -- :cmd', (t) => {
  angel.do('cells -- npm run test', err => {
    t.assert(err !== undefined)
    t.end()
  })
})

test.cb('failing no missing cell', (t) => {
  angel.do('cell non-existing -- npm run test', err => {
    t.assert(err.message === 'no cells found')
    t.end()
  })
})
