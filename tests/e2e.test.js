const path = require('path')
const Angel = require('organic-angel')
const angel = new Angel()
const test = require('ava')

const cwd = process.cwd()
test.before(() => {
  process.chdir(path.join(__dirname, 'test-monorepo'))
  require('../index')(angel)
})
test.after(() => {
  process.chdir(cwd)
})

test('cells -- :cmd', async (t) => {
  t.timeout(64 * 1000)
  const r = angel.do('cells -- npm install')
  await t.notThrowsAsync(r)
})

test('cell :cellName -- :cmd', async (t) => {
  t.timeout(64 * 1000)
  const r = angel.do('cell api -- npm install')
  await t.notThrowsAsync(r)
})

test('cells :groupName -- :cmd', async (t) => {
  t.timeout(64 * 1000)
  const r = angel.do('cells backend -- npm install')
  await t.notThrowsAsync(r)
})

test('(multi-group) cells :groupName -- :cmd', async (t) => {
  t.timeout(64 * 1000)
  const r = angel.do('cells test -- npm install')
  await t.notThrowsAsync(r)
})

test('failing on error within a cell -- :cmd', async (t) => {
  try {
    await angel.do('cells -- npm run test')
  } catch (err) {
    t.assert(err.message !== 'web npm run test returned 1')
  }
})

test('failing on missing cell', async (t) => {
  try {
    await angel.do('cell non-existing -- npm run test')
  } catch (err) {
    t.assert(err.message === 'no cells found')
  }
})
