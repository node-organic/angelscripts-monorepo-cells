const execa = require('execa')
const loadDna = require('organic-dna-loader')
const path = require('path')
const colors = require('chalk')

module.exports = function (angel) {
  const CELLS_ROOT = angel.cells_root || process.cwd()
  const executeCommand = async function ({ cellName, cmd, cwd, env }) {
    return new Promise((resolve, reject) => {
      console.log(colors.blue(cellName), cmd)
      let child = execa.shell(cmd, {
        cwd: cwd,
        env: env
      })
      child.stdout.on('data', chunk => {
        console.log(colors.blue(cellName), chunk.toString())
      })
      child.stderr.on('data', chunk => {
        console.error(colors.blue(cellName), colors.red(chunk.toString()))
      })
      child.on('close', status => {
        if (status !== 0) return reject(new Error(cmd + ' returned ' + status))
        resolve()
      })
    })
  }
  const executeCommandOnCells = async function ({cmd, cellName, groupName}, done) {
    loadDna(path.join(CELLS_ROOT, 'dna'), (err, dna) => {
      if (err) throw err
      let tasks = []
      for (let name in dna.cells) {
        if (cellName && name !== cellName) continue
        if (groupName && dna.cells[name].group !== groupName) continue
        tasks.push({
          name: name,
          cellDna: dna.cells[name]
        })
      }
      if (tasks.length === 0) {
        throw new Error('no cells found')
      }
      let tasksCounter = tasks.length
      tasks.forEach(info => {
        executeCommand({
          cellName: info.name,
          cmd: cmd,
          cwd: path.join(CELLS_ROOT, 'cells', info.name),
          env: process.env
        }).catch(err => {
          console.error(colors.red(info.name), err)
          done(err)
        }).then(() => {
          tasksCounter -= 1
          if (tasksCounter === 0) done()
        })
      })
    })
  }
  angel.on(/repo cell (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[2],
      cellName: angel.cmdData[1]
    }, done)
  })
    .description('executes :cmd on cell by its :name')
    .example('$ angel repo cell :name -- :cmd')
  angel.on(/repo cells -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[1]
    }, done)
  })
    .description('executes :cmd on all cells')
    .example('repo cells -- :cmd')
  angel.on(/repo cellgroup (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[2],
      groupName: angel.cmdData[1]
    }, done)
  })
    .description('executes :cmd on all cells within group with :groupname')
    .example('repo cellgroup :groupname -- :cmd')
}
