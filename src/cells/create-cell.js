const path = require('path')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const writeFile = util.promisify(require('fs').writeFile)
const { appendCellPath } = require('../tools')
const prompts = require('prompts')
const YAML = require('yaml')

module.exports = function (angel) {
  angel.on('create cell :name', async function (angel) {
    const answers = {
      cellName: angel.cmdData.name,
      cellGroup: '',
      cellKind: ''
    }
    await createCell(answers)
  })
  angel.on('create cell', async function (angel) {
    const questions = [
      {
        type: 'text',
        message: 'cell name',
        name: 'cellName',
        initial: generateCellName()
      },
      {
        type: 'text',
        message: 'cell group',
        description: 'can be empty',
        name: 'cellGroup',
        initial: ''
      },
      {
        type: 'text',
        name: 'cellKind',
        message: 'cell kind',
        description: 'can be empty',
        initial: ''
      }
    ]
    const answers = await prompts(questions)
    await createCell(answers)
  })
}

const createCell = async function (answers) {
  const cellpath = path.join('cells', answers.cellGroup, answers.cellName)
  await exec(`mkdir -p ${cellpath}`)
  await exec(`mkdir -p ${cellpath}/dna`)
  const jsonpath = `${cellpath}/dna/index.yaml`
  await writeYAML(jsonpath, {
    cellKind: answers.cellKind,
    cellInfo: 'v1',
    cwd: cellpath
  })
  await appendCellPath(cellpath)
  console.info('done')
}

const generateCellName = function () {
  return 'cell' + Math.ceil(Math.random() * 100)
}

const writeYAML = async function (filepath, obj) {
  await writeFile(filepath, YAML.stringify(obj))
}
