const fs = require('fs')
const execa = require('execa') // 开启子进程
const targets = fs.readdirSync('packages').filter(f => {
    if (!fs.statSync(`packages/${f}`).isDirectory()) {
        return false
    }
    return true
})

async function build(target) {
    // 子进程打包信息共享给父进程
    await execa('rollup', ['-c', '--environment', `TARGET:${target}`], { stdio: 'inherit' })
}
function runParallel(targets, iteratorFn) {
    const res = []
    for (const item of targets) {
        const p = iteratorFn(item)
        res.push(p)
    }
    return Promise.all(res)
}
runParallel(targets, build)