const path = require('path')
const prompts = require('prompts')
const findRoot = require('organic-stem-skeleton-find-root')
const loadDna = require('organic-dna-repo-loader')
const { getCell } = require('organic-dna-cells-info')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const writeFile = util.promisify(require('fs').writeFile)
const readFile = util.promisify(require('fs').readFile)
const YAML = require('yaml')
const { removeCellPath, appendCellPath } = require('../tools')

module.exports = function (angel) {
  angel.on('rename cell :cellName :newCellName', async function (angel) {
    const answers = {
      cellName: angel.cmdData.cellName,
      newCellName: angel.cmdData.newCellName,
      newCellGroup: ''
    }
    await renameCell(answers)
  })
  angel.on('rename cell', async function (angel) {
    const questions = [
      {
        name: 'cellName',
        type: 'text',
        message: 'cell name'
      },
      {
        name: 'newCellName',
        type: 'text',
        message: 'new cell name'
      },
      {
        name: 'newCellGroup',
        type: 'text',
        initial: '',
        message: 'new cell group'
      }
    ]
    const answers = await prompts(questions)
    await renameCell(answers)
  })
}

const renameCell = async function (answers) {
  const repopath = await findRoot()
  const dna = await loadDna({ root: repopath })
  const cellInfo = await getCell(dna.cells, answers.cellName)
  if (!cellInfo) throw new Error('cell not found ' + answers.cellName)
  const oldCellpath = cellInfo.dna.cwd
  const newCellpath = path.join('cells', answers.newCellGroup, answers.newCellName)
  if (answers.newCellGroup) {
    await exec(`mkdir -p cells/${answers.newCellGroup}`)
  }
  await exec(`mv ${oldCellpath} ${newCellpath}`)
  await removeCellPath(oldCellpath)
  await appendCellPath(newCellpath)
  const jsonpath = `${newCellpath}/dna/index.yaml`
  await updateYAML(jsonpath, {
    cwd: newCellpath
  })
  console.info('done')
}

const updateYAML = async function (filepath, obj) {
  let data = await readFile(filepath, 'utf-8')
  data = YAML.parse(data)
  Object.assign(data, obj)
  await writeFile(filepath, YAML.stringify(data))
}
