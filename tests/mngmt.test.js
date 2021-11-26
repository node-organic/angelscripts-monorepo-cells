const path = require('path')
const Angel = require('organic-angel')
const angel = new Angel()
const test = require('ava')

require('../index')(angel)

const cwd = process.cwd()
test.before(() => {
  process.chdir(path.join(__dirname, 'test-monorepo'))
})
test.after(() => {
  process.chdir(cwd)
})

test('e2e mngmt', async (t) => {
  t.timeout(64 * 1000)
  const r = angel.do('create cell api2')
  await t.notThrowsAsync(r)
  const r2 = angel.do('rename cell api2 api3')
  await t.notThrowsAsync(r2)
  const r3 = angel.do('delete cell api3 api3')
  await t.notThrowsAsync(r3)
})
