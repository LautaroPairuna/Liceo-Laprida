import { execFileSync, spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const apiDir = join(root, "apps/api");
const apiPort = process.env.API_PORT ?? "4000";
const prismaCli = createRequire(join(apiDir, "package.json")).resolve("prisma/build/index.js");

console.log("[start] aplicando migraciones");
execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], { cwd: apiDir, stdio: "inherit" });

const children = new Set();
let stopping = false;

function run(name, args, cwd, extraEnv) {
  const child = spawn(process.execPath, args, {
    cwd,
    env: { ...process.env, ...extraEnv },
    stdio: "inherit",
  });
  children.add(child);
  child.on("exit", (code, signal) => {
    children.delete(child);
    if (!stopping) {
      console.error(`[start] ${name} terminó (${signal ?? code}); se baja el contenedor`);
      stop(code || 1);
    }
    if (children.size === 0) process.exit(process.exitCode ?? 0);
  });
}

// A single dead process takes the container down so Dokploy restarts both,
// instead of leaving the site up without its API (or the other way around).
function stop(exitCode) {
  if (stopping) return;
  stopping = true;
  process.exitCode = exitCode;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(exitCode), 10_000).unref();
}

process.on("SIGTERM", () => stop(0));
process.on("SIGINT", () => stop(0));

run("api", ["--max-old-space-size=256", "dist/main.js"], apiDir, { PORT: apiPort });
run("web", ["--max-old-space-size=384", "apps/web/.next/standalone/apps/web/server.js"], root, {
  PORT: process.env.PORT ?? "3000",
  HOSTNAME: "0.0.0.0",
  API_INTERNAL_URL: process.env.API_INTERNAL_URL ?? `http://127.0.0.1:${apiPort}`,
});
