/**
 * First-run bootstrap: Python 3 is required for the default `swarm` CLI orchestrator.
 * Tries unobtrusive installers (winget / brew / non-interactive apt) before printing copy-paste help.
 */

import { existsSync } from 'fs'
import { spawnSync } from 'child_process'

const skip = (): boolean =>
  process.env.SWARM_SKIP_DEPS_BOOTSTRAP === '1'

function writeln(s: string): void {
  process.stderr.write(`${s}\n`)
}

/** Returns command + args prefix to invoke Python for orchestrator spawn, or null if unavailable. */
export function resolvePythonArgv(): string[] | null {
  const fromEnv = process.env.SWARM_PYTHON?.trim()
  if (fromEnv) {
    return [fromEnv]
  }

  for (const exe of ['python3', 'python']) {
    const r = spawnSync(exe, ['-V'], {
      encoding: 'utf8',
      shell: process.platform === 'win32',
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    if (r.status === 0) {
      return [exe]
    }
  }

  // Windows Store / py launcher ("py -3" is stable when multiple Pythons exist)
  if (process.platform === 'win32') {
    const py3 = spawnSync('py', ['-3', '-V'], {
      encoding: 'utf8',
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    if (py3.status === 0) {
      return ['py', '-3']
    }
  }

  return null
}

function hasPython(): boolean {
  return resolvePythonArgv() !== null
}

/** Best-effort; may require elevation or user confirmation on some systems. */
function tryInstallPython(): void {
  const plat = process.platform

  if (plat === 'win32') {
    writeln('Trying Windows installer (winget Python 3.12)…')
    const wingetTry = spawnSync(
      'winget',
      [
        'install',
        '-e',
        '--id',
        'Python.Python.3.12',
        '--accept-package-agreements',
        '--accept-source-agreements',
      ],
      { stdio: 'inherit', shell: true },
    )
    if (wingetTry.status === 0) {
      return
    }
    writeln(
      'winget install did not succeed (missing winget, policy block, or needs admin). Install Python manually: https://www.python.org/downloads/windows/',
    )
    return
  }

  if (plat === 'darwin') {
    const brewCandidates = ['/opt/homebrew/bin/brew', '/usr/local/bin/brew']
    const brew =
      brewCandidates.find((p) => existsSync(p)) ??
      (spawnSync('which', ['brew'], { encoding: 'utf8' }).stdout?.trim() ||
        '')
    if (brew.length > 0) {
      writeln('Trying Homebrew (python@3.12)…')
      spawnSync(brew, ['install', 'python@3.12'], { stdio: 'inherit' })
      return
    }
    writeln('Homebrew not found. Install Python: https://www.python.org/downloads/macos/')
    return
  }

  if (plat === 'linux') {
    writeln('Trying non-interactive apt (needs passwordless sudo _or_ root)…')
    const apt = spawnSync('sudo', ['-n', 'apt-get', 'install', '-y', 'python3'], {
      stdio: 'inherit',
    })
    if (apt.status === 0) {
      return
    }
    const dnf = spawnSync('sudo', ['-n', 'dnf', 'install', '-y', 'python3'], {
      stdio: 'inherit',
    })
    if (dnf.status === 0) {
      return
    }
    writeln('Automatic install skipped (needs sudo). Run one of:')
    writeln('  sudo apt install python3    # Debian / Ubuntu')
    writeln('  sudo dnf install python3    # Fedora / RHEL')
    return
  }

  writeln(`Install Python 3 manually for platform "${plat}" (https://python.org/downloads/).`)
}

function printHintsAfterFailure(): void {
  writeln('')
  writeln('Still no Python — install manually, reopen the terminal, then run swarm again.')
  if (process.platform === 'win32') {
    writeln('Windows: enable “Add python.exe to PATH” in the official installer.')
  }
}

/**
 * Guaranteed before spawning orchestrator.py: checks Python once and tries installers if missing.
 */
export async function ensureOrchestratorRuntime(): Promise<void> {
  if (skip()) {
    return
  }
  if (hasPython()) {
    return
  }

  writeln('')
  writeln('Swarm needs Python 3 on your PATH.')
  writeln('Trying to install automatically (once). You can disable this with SWARM_SKIP_DEPS_BOOTSTRAP=1.')
  writeln('')

  tryInstallPython()

  if (hasPython()) {
    writeln('Python detected — continuing.')
    writeln('')
    return
  }

  printHintsAfterFailure()
  process.exit(1)
}
