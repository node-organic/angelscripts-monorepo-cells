const { executeCommandOnCells } = require('../tools')
const loadDna = require('organic-dna-repo-loader')
const { getAllCells } = require('organic-dna-cells-info')

module.exports = function (angel) {
  const ROOT = process.cwd()

  require('./create-cell')(angel)
  require('./delete-cell')(angel)
  require('./rename-cell')(angel)

  angel.on(/cell (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      root: ROOT,
      cmd: angel.cmdData[2],
      cellName: angel.cmdData[1],
      forwardStdin: true
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on cell by its :name')
    .example('$ angel cell :name -- :cmd')
  angel.on(/cells -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      root: ROOT,
      cmd: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all cells')
    .example('cells -- :cmd')
  angel.on(/cells (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      root: ROOT,
      cmd: angel.cmdData[2],
      groupName: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all cells within group with :groupname')
    .example('cells :groupname -- :cmd')
  angel.on(/^cells$/, async function (angel, done) {
    const dna = await loadDna({ root: ROOT })
    const cells = getAllCells(dna.cells)
    for (let i = 0; i < cells.length; i++) {
      console.info(`${cells[i].name} - ${cells[i].dna.cellKind} @ ${cells[i].dna.cwd}`)
    }
    done()
  })
    .description('lists all found cells')
    .example('cells')
  angel.on(/^cells.json$/, async function (angel, done) {
    const dna = await loadDna({ root: ROOT })
    const cells = getAllCells(dna.cells)
    console.info(JSON.stringify(cells))
    done()
  })
    .description('dumps all found cells with their DNA included as json')
    .example('cells.json')
}
