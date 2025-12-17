const { execSync } = require('child_process');

const port = parseInt(process.argv[2], 10);
if (!Number.isFinite(port)) {
  console.error('Usage: node utils/kill-port.js <port>');
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { stdio: ['ignore', 'pipe', 'pipe'] }).toString();

try {
  if (process.platform === 'win32') {
    // netstat output format: TCP    0.0.0.0:5000   ...   LISTENING   <PID>
    const output = run(`netstat -ano | findstr :${port}`);
    const pids = new Set();

    output
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .forEach((line) => {
        const parts = line.split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && /^\d+$/.test(pid)) pids.add(pid);
      });

    if (pids.size === 0) {
      console.log(`[kill-port] No process found on port ${port}`);
      process.exit(0);
    }

    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: 'inherit' });
      } catch (e) {
        // If taskkill fails for one PID, keep trying others.
      }
    }

    console.log(`[kill-port] Killed process(es) on port ${port}`);
    process.exit(0);
  }

  // macOS/Linux fallback
  const pids = run(`lsof -ti tcp:${port} || true`)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!pids.length) {
    console.log(`[kill-port] No process found on port ${port}`);
    process.exit(0);
  }

  execSync(`kill -9 ${pids.join(' ')}`, { stdio: 'inherit' });
  console.log(`[kill-port] Killed process(es) on port ${port}`);
  process.exit(0);
} catch (err) {
  // If netstat/findstr returns no matches it throws; treat as success.
  if (process.platform === 'win32') {
    console.log(`[kill-port] No process found on port ${port}`);
    process.exit(0);
  }
  console.error('[kill-port] Failed:', err?.message || err);
  process.exit(1);
}
