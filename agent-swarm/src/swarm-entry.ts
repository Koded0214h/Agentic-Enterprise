/**
 * Default `swarm` CLI entry: runs the Python orchestrator bundled with the package.
 *
 * - `swarm` / `swarm tui` → Python orchestrator (interactive when no args).
 * - `swarm studio` or `--studio` or `SWARM_STUDIO=1` → full Ink stack (`dist/main.js`) when present.
 */
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import {
  ensureOrchestratorRuntime,
  resolvePythonArgv,
} from './swarm-bootstrap-deps.js';
import { getSwarmNetworkChildEnv } from './swarm-network.js';
import { maybeNotifySwarmUpdate } from './swarm-update-notify.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function getSwarmPackageRoot(): string {
  const fromEnv = process.env.SWARM_ROOT;
  if (fromEnv && existsSync(join(fromEnv, 'orchestrator.py'))) {
    return fromEnv;
  }
  return join(__dirname, '..');
}

function prepareArgv(argv: string[]): { studio: boolean; passthrough: string[] } {
  let studio =
    process.env.SWARM_STUDIO === '1' || argv.includes('--studio') || argv.includes('-S');

  let filtered = argv.filter((a) => a !== '--studio' && a !== '-S');

  if (filtered[0] === 'tui') {
    filtered = filtered.slice(1);
  }
  if (filtered[0] === 'studio') {
    studio = true;
    filtered = filtered.slice(1);
  }

  return { studio, passthrough: filtered };
}

async function run(): Promise<void> {
  const pkgRoot = getSwarmPackageRoot();
  await maybeNotifySwarmUpdate(pkgRoot);
  const netEnv = getSwarmNetworkChildEnv(pkgRoot);
  const childEnv = { ...process.env, SWARM_ROOT: pkgRoot, ...netEnv };
  const { studio, passthrough } = prepareArgv(process.argv.slice(2));

  if (studio) {
    const mainJs = join(pkgRoot, 'dist', 'main.js');
    if (!existsSync(mainJs)) {
      process.stderr.write(
        'SWARM studio build missing: dist/main.js not found. Run `npm run build:studio` once the project compiles, or use `npm run dev`.\n',
      );
      process.exit(1);
    }
    const child = spawn(process.execPath, [mainJs, ...passthrough], {
      stdio: 'inherit',
      cwd: process.cwd(),
      env: childEnv,
    });
    child.on('exit', (code) => process.exit(code ?? 0));
    child.on('error', (err) => {
      process.stderr.write(`${err.message}\n`);
      process.exit(1);
    });
    return;
  }

  await ensureOrchestratorRuntime();

  const orchestratorPath = join(pkgRoot, 'orchestrator.py');
  if (!existsSync(orchestratorPath)) {
    process.stderr.write(`Swarm orchestrator not found at ${orchestratorPath}\n`);
    process.exit(1);
  }

  const py = resolvePythonArgv();
  if (!py?.length) {
    process.stderr.write(
      'No Python interpreter found after bootstrap. Install Python 3 or set SWARM_PYTHON.\n',
    );
    process.exit(1);
  }

  const child = spawn(py[0], [...py.slice(1), orchestratorPath, ...passthrough], {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: childEnv,
  });
  child.on('exit', (code) => process.exit(code ?? 0));
  child.on('error', (err) => {
    process.stderr.write(
      `Failed to start Python (${py.join(' ')}): ${err.message}\n` +
        'Install Python 3 and ensure it is on PATH, or set SWARM_PYTHON to the interpreter path.\n',
    );
    process.exit(1);
  });
}

void run().catch((err) => {
  process.stderr.write(`${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
