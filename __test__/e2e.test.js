const path = require('path')
const Angel = require('organic-angel')
const angel = new Angel()
angel.cells_root = path.join(__dirname, 'test-monorepo')
require('../index')(angel)

test('repo cells -- :cmd', (done) => {
  jest.setTimeout(60 * 1000)
  angel.do('repo cells -- npm install', done)
})
