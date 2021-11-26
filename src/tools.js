const { exec } = require('child_process')
const colors = require('ansi-colors')
const util = require('util')
const readFile = util.promisify(require('fs').readFile)
const writeFile = util.promisify(require('fs').writeFile)
const YAML = require('yaml')

const loadDna = require('organic-dna-repo-loader')
const { getAllCells } = require('organic-dna-cells-info')

const path = require('path')
const { forEach } = require('p-iteration')

const terminateAsync = async function (pid) {
  return new Promise((resolve, reject) => {
    process.kill(pid, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}

const formatBlue = function (value) {
  return '[' + colors.blue(value) + ']'
}

const executeCommand = async function ({ name, cmd, cwd, env, forwardStdin }) {
  return new Promise((resolve, reject) => {
    console.log(formatBlue(name), cmd, '@', cwd)
    const child = exec(cmd, {
      cwd: cwd,
      env: env
    })
    child.stdout.on('data', chunk => {
      console.log(formatBlue(name), chunk.toString())
    })
    child.stderr.on('data', chunk => {
      console.error(formatBlue(name), colors.red(chunk.toString()))
    })
    if (forwardStdin) {
      process.stdin.pipe(child.stdin)
      process.stdin.resume()
    }
    child.on('exit', status => {
      if (status !== 0) return reject(new Error(formatBlue(name) + ' ' + cmd + ' returned ' + status))
      resolve()
    })
  })
}

module.exports.executeCommandOnCells = async function ({ root, cmd, cellName, groupName, forwardStdin }) {
  const dna = await loadDna({ root })
  const tasks = []
  const cells = getAllCells(dna.cells)
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
    throw new Error('no cells found')
  }
  const runningChilds = []
  const childHandler = function (child) {
    runningChilds.push(child)
    child.on('close', () => {
      runningChilds.splice(runningChilds.indexOf(child), 1)
    })
  }
  await forEach(tasks, async taskInfo => {
    return executeCommand({
      name: taskInfo.name,
      cmd: cmd,
      cwd: path.join(root, taskInfo.cwd),
      env: process.env,
      childHandler: childHandler,
      forwardStdin: forwardStdin
    })
  })
  runningChilds.forEach(function (child) {
    child.terminating = true
  })
  const pids = runningChilds.map(v => v.pid)
  try {
    await forEach(pids, terminateAsync)
  } catch (e) { /** ignore e */ }
}

module.exports.removeCellPath = async function (value) {
  const dnapath = process.cwd() + '/dna/cells/index.yaml'
  let data = await readFile(dnapath, 'utf-8')
  data = YAML.parse(data)
  const index = data.cellPaths.indexOf(value)
  if (index !== -1) {
    data.cellPaths.splice(index, 1)
  }
  await writeFile(dnapath, YAML.stringify(data))
}

module.exports.appendCellPath = async function (value) {
  const dnapath = process.cwd() + '/dna/cells/index.yaml'
  let data = await readFile(dnapath, 'utf-8')
  data = YAML.parse(data)
  if (!data.cellPaths.includes(value)) {
    data.cellPaths.push(value)
  }
  await writeFile(dnapath, YAML.stringify(data))
}
