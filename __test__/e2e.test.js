const path = require('path')
const Angel = require('organic-angel')
const angel = new Angel()
angel.cells_root = path.join(__dirname, 'test-monorepo')
require('../index')(angel)

test('repo cells -- :cmd', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cells -- npm install', done)
})

test('repo cell :cellName -- :cmd', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cell api -- npm install', done)
})

test('repo cellgroup :groupName -- :cmd', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cellgroup backend -- npm install', done)
})

test('(multi-group) repo cellgroup :groupName -- :cmd', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cellgroup test -- npm install', done)
})

test('failing grecefully repo cells -- :cmd', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cells -- npm run test', err => {
    expect(err).toBeDefined()
    done()
  })
})

test('failing no missing cell', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cell non-existing -- npm run test', err => {
    expect(err).toBeDefined()
    done()
  })
})
