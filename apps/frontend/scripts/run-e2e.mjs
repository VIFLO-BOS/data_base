import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const frontendRoot = fileURLToPath(new URL('..', import.meta.url));
const nextCli = path.resolve(frontendRoot, '../../node_modules/next/dist/bin/next');
const playwrightCli = path.resolve(frontendRoot, '../../node_modules/@playwright/test/cli.js');
const suppliedBaseUrl = process.env.E2E_BASE_URL;
const baseUrl = suppliedBaseUrl || 'http://127.0.0.1:4317';
let server;
let exitCode = 1;

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });
}

async function waitForServer(url, child) {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`Next.js exited before becoming ready (code ${child.exitCode}).`);
    }

    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  throw new Error(`Next.js did not become ready at ${url} within 60 seconds.`);
}

async function stopServer(child) {
  if (!child || child.exitCode !== null) return;

  if (process.platform === 'win32') {
    // Windows does not propagate POSIX signals through the Next.js process tree.
    spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }

  child.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => child.once('exit', resolve)),
    new Promise((resolve) => setTimeout(resolve, 5_000)),
  ]);
  if (child.exitCode === null) child.kill('SIGKILL');
}

try {
  if (!suppliedBaseUrl) {
    server = spawn(process.execPath, [nextCli, 'start', '--hostname', '127.0.0.1', '--port', '4317'], {
      cwd: frontendRoot,
      env: process.env,
      stdio: 'inherit',
    });
    await waitForServer(`${baseUrl}/login`, server);
  }

  const result = await run(process.execPath, [playwrightCli, 'test', ...process.argv.slice(2)], {
    cwd: frontendRoot,
    env: { ...process.env, E2E_BASE_URL: baseUrl },
    stdio: 'inherit',
  });
  exitCode = result.code ?? 1;
} finally {
  await stopServer(server);
}

// Child-process pipes can remain referenced briefly on Windows even after the
// process tree has stopped. Cleanup is complete here, so exit deterministically.
process.exit(exitCode);
