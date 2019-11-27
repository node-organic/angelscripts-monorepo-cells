const {exec} = require('child_process')
const loadDna = require('organic-dna-repo-loader')
const path = require('path')
const colors = require('chalk')
const {forEach} = require('p-iteration')
const cellsinfo = require('organic-dna-cells-info')

const terminateAsync = async function (pid) {
  return new Promise((resolve, reject) => {
    process.kill(pid)
    resolve()
  })
}

const formatCellName = function (value) {
  return '[' + colors.blue(value) + ']'
}

module.exports = function (angel) {
  const CELLS_ROOT = angel.cells_root || process.cwd()

  const executeCommand = async function ({ cellName, cmd, cwd, env, childHandler, forwardStdin }) {
    return new Promise((resolve, reject) => {
      console.log(formatCellName(cellName), cmd)
      let child = exec(cmd, {
        cwd: cwd,
        env: env,
        maxBuffer: Infinity
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
      if (forwardStdin) {
        process.stdin.pipe(child.stdin)
        process.stdin.resume()
      }
      child.on('exit', status => {
        console.log(formatCellName(cellName), 'exit with status', status)
        if (child.terminating) return console.info(formatCellName(cellName), 'was terminated')
        if (status !== 0) {
          return reject(new Error(cellName + ' ' + cmd + ' returned ' + status))
        }
        resolve()
      })
    })
  }
  const executeCommandOnCells = async function ({cmd, cellName, groupName, forwardStdin}) {
    return new Promise(async (resolve, reject) => {
      let dna = await loadDna({root: CELLS_ROOT})
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
          childHandler: childHandler,
          forwardStdin: forwardStdin
        })
      }).then(resolve).catch(async err => {
        runningChilds.forEach(function (child) {
          child.terminating = true
        })
        let pids = runningChilds.map(v => v.pid)
        try {
          await forEach(pids, terminateAsync)
        } catch (e) { /** ignore e */ }
        reject(err)
      })
    })
  }
  angel.on(/cell (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[2],
      cellName: angel.cmdData[1],
      forwardStdin: true
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on cell by its :name')
    .example('$ angel cell :name -- :cmd')
  angel.on(/cells -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all cells')
    .example('cells -- :cmd')
  angel.on(/cells (.*) -- (.*)/, function (angel, done) {
    executeCommandOnCells({
      cmd: angel.cmdData[2],
      groupName: angel.cmdData[1]
    }).then(() => done()).catch(done)
  })
    .description('executes :cmd on all cells within group with :groupname')
    .example('cells :groupname -- :cmd')
  angel.on(/^cells$/, async function (angel, done) {
    let dna = await loadDna({root: CELLS_ROOT})
    let cells = cellsinfo(dna.cells)
    for (let i = 0; i < cells.length; i++) {
      console.info(`${cells[i].name} - ${cells[i].dna.cellKind} @ ${cells[i].dna.cwd}`)
    }
    done()
  })
    .description('lists all found cells')
    .example('cells')
  angel.on(/^cells.json$/, async function (angel, done) {
    let dna = await loadDna({root: CELLS_ROOT})
    let cells = cellsinfo(dna.cells)
    console.info(JSON.stringify(cells))
    done()
  })
    .description('dumps all found cells with their DNA included as json')
    .example('cells.json')
}
