const prompts = require('prompts')
const findRoot = require('organic-stem-skeleton-find-root')
const loadDna = require('organic-dna-repo-loader')
const { getCell } = require('organic-dna-cells-info')
const util = require('util')
const exec = util.promisify(require('child_process').exec)

const { removeCellPath } = require('../tools')

module.exports = function (angel) {
  angel.on('delete cell :cellName :cellNameAgain', async function (angel) {
    const answers = {
      cellName: angel.cmdData.cellName,
      cellNameAgain: angel.cmdData.cellNameAgain
    }
    await deleteCell(answers)
  })
  angel.on('delete cell', async function (angel) {
    const questions = [
      {
        type: 'text',
        name: 'cellName',
        message: 'cell name',
      },
      {
        type: 'text',
        name: 'cellNameAgain',
        message: 'cell name again'
      }
    ]
    const answers = await prompts(questions)
    await deleteCell(answers)
  })
}

const deleteCell = async function (answers) {
  if (answers.cellName === answers.cellNameAgain) {
    const repopath = await findRoot()
    const dna = await loadDna({ root: repopath })
    const cellInfo = await getCell(dna.cells, answers.cellName)
    if (!cellInfo) throw new Error('cell not found ' + answers.cellName)
    const cellpath = cellInfo.dna.cwd
    await exec(`rm -rf ${cellpath}`)
    await removeCellPath(cellpath)
    console.info('done')
  } else {
    throw new Error('cellName doesnt match')
  }
}
