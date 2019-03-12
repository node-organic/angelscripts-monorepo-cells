const {exec} = require('child_process')
const loadDna = require('organic-dna-loader')
const path = require('path')
const colors = require('chalk')
const {forEach} = require('p-iteration')
const terminate = require('terminate')
const cellsinfo = require('organic-dna-cells-info')

const terminateAsync = async function (pid) {
  return new Promise((resolve, reject) => {
    terminate(pid, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

const formatCellName = function (value) {
  return '[' + colors.blue(value) + ']'
}

module.exports = function (angel) {
  const CELLS_ROOT = angel.cells_root || process.cwd()
  const executeCommand = async function ({ cellName, cmd, cwd, env, childHandler }) {
    return new Promise((resolve, reject) => {
      console.log(formatCellName(cellName), cmd)
      let child = exec(cmd, {
        cwd: cwd,
        env: env
      })
      if (childHandler) {
        childHandler(child)
      }
      child.stdout.on('data', chunk => {
        console.log(formatCellName(cellName), chunk.toString())
      })
      child.stderr.on('data', chunk => {
        console.error(formatCellName(cellName), colors.red(chunk.toString()))
      })
      child.on('close', status => {
        if (status !== 0) return reject(new Error(cellName + ' ' + cmd + ' returned ' + status))
        resolve()
      })
    })
  }
  const executeCommandOnCells = async function ({cmd, cellName, groupName}) {
    return new Promise((resolve, reject) => {
      loadDna(path.join(CELLS_ROOT, 'dna'), async (err, dna) => {
        if (err) return reject(err)
        let tasks = []
        let cells = cellsinfo(dna.cells)
        cells.forEach((cell) => {
          if (cellName && cell.name !== cellName) return
          if (groupName && cell.groups.indexOf(groupName) === -1) return
          tasks.push({
            name: cell.name,
            cellDna: cell.dna,
            cwd: cell.dna.cwd
          })
        })
        if (tasks.length === 0) {
          return reject(new Error('no cells found'))
        }
        let runningChilds = []
        let childHandler = function (child) {
          runningChilds.push(child)
          child.on('close', () => {
            runningChilds.splice(runningChilds.indexOf(child), 1)
          })
        }
        forEach(tasks, async taskInfo => {
          return executeCommand({
            cellName: taskInfo.name,
            cmd: cmd,
            cwd: path.join(CELLS_ROOT, taskInfo.cwd),
            env: process.env,
            childHandler: childHandler
          })
        }).then(resolve).catch(async err => {
          let pids = runningChilds.map(v => v.pid)
          await forEach(pids, terminateAsync)
          reject(err)
        })
      })
    })
  }
  angel.on(/repo cell (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[2],
      cellName: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on cell by its :name')
    .example('$ angel repo cell :name -- :cmd')
  angel.on(/repo cells -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all cells')
    .example('repo cells -- :cmd')
  angel.on(/repo cellgroup (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[2],
      groupName: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all cells within group with :groupname')
    .example('repo cellgroup :groupname -- :cmd')
  angel.on(/repo list cells/, function (angel, done) {
    loadDna(path.join(CELLS_ROOT, 'dna'), async (err, dna) => {
      if (err) throw err
      let cells = cellsinfo(dna.cells)
      for (let i = 0; i < cells.length; i++) {
        console.info(`${cells[i].name} - ${cells[i].dna.cellKind} @ ${cells[i].dna.cwd}`)
      }
    })
  })
    .description('lists all found cells')
    .example('repo list cells')
  angel.on(/repo dump cells.json/, function (angel, done) {
    loadDna(path.join(CELLS_ROOT, 'dna'), async (err, dna) => {
      if (err) throw err
      let cells = cellsinfo(dna.cells)
      console.info(JSON.stringify(cells))
    })
  })
    .description('dumps all found cells with their resolved DNA included as json')
    .example('repo dump cells.json')
}
