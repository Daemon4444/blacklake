import { spawn } from "node:child_process";

const runtimeNode = "/Users/daemon1/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node";

const children = [
  spawn(runtimeNode, ["server/index.js"], { stdio: "inherit", env: { ...process.env, PORT: "8787" } }),
  spawn(runtimeNode, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5173"], { stdio: "inherit" }),
];

function shutdown() {
  children.forEach((child) => child.kill("SIGTERM"));
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
