const execa = require("execa"); // 开启子进程

// const target = "reactivity"
const target = "runtime-dom";
async function build(target) {
  // 子进程打包信息共享给父进程
  await execa("rollup", ["-cw", "--environment", `TARGET:${target}`], {
    stdio: "inherit",
  });
}
build(target);
