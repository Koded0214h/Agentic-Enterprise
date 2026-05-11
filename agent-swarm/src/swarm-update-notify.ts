/**
 * On interactive launch: compare installed version vs npm registry, offer upgrade.
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import { spawn } from 'child_process'
import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

function isSemver(v: string): boolean {
  return /^\d+\.\d+\.\d+/.test(v)
}

function semverGt(a: string, b: string): boolean {
  const parts = (s: string) => s.split('.').slice(0, 3).map(p => parseInt(p, 10) || 0)
  const [a1 = 0, a2 = 0, a3 = 0] = parts(a)
  const [b1 = 0, b2 = 0, b3 = 0] = parts(b)
  if (a1 !== b1) return a1 > b1
  if (a2 !== b2) return a2 > b2
  return a3 > b3
}

const PKG_NAME = '@anas.abubakar/swarm'

const cacheDir = () => {
  const d = join(homedir(), '.cache', 'swarm-cli')
  return d
}

const cachePath = () => join(cacheDir(), 'update-check.json')

type CacheShape = {
  checkedAt: number
  /** Last published version observed from npm (may be stale if within ttl for network skip). */
  latest: string
  /** When we last showed the “upgrade?” prompt while outdated */
  promptedAt?: number
}

function readCache(): CacheShape | null {
  try {
    const raw = readFileSync(cachePath(), 'utf8')
    return JSON.parse(raw) as CacheShape
  } catch {
    return null
  }
}

function writeCache(c: CacheShape): void {
  try {
    mkdirSync(cacheDir(), { recursive: true })
    writeFileSync(cachePath(), JSON.stringify(c, null, 0), 'utf8')
  } catch {
    /* ignore disk errors */
  }
}

function getInstalledVersion(packageRoot: string): string | null {
  try {
    const pkg = JSON.parse(
      readFileSync(join(packageRoot, 'package.json'), 'utf8'),
    ) as { version?: string }
    return pkg.version ?? null
  } catch {
    return null
  }
}

async function fetchLatestVersion(): Promise<string | null> {
  try {
    const res = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(PKG_NAME)}/latest`,
      {
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(12_000),
      },
    )
    if (!res.ok) return null
    const data = (await res.json()) as { version?: string }
    return data.version ?? null
  } catch {
    return null
  }
}

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000
const PROMPT_COOLDOWN_MS = 36 * 60 * 60 * 1000

/**
 * Warn if a newer semver is published; optional `npm install -g` on approval.
 */
export async function maybeNotifySwarmUpdate(
  swarmPackageRoot: string,
): Promise<void> {
  if (process.env.SWARM_SKIP_UPDATE_CHECK === '1') return
  if (!output.isTTY) return

  const current = getInstalledVersion(swarmPackageRoot)
  if (!current || current === '0.0.0') return

  let cache = readCache()
  const stale =
    !cache || Date.now() - cache.checkedAt > CHECK_INTERVAL_MS || !cache.latest

  let latest = cache?.latest
  if (stale) {
    latest = await fetchLatestVersion()
    const nextCache: CacheShape = {
      checkedAt: Date.now(),
      latest: latest ?? cache?.latest ?? current,
      promptedAt: cache?.promptedAt,
    }
    writeCache(nextCache)
    cache = nextCache
  }

  latest = cache?.latest
  if (!latest || latest === current) return
  if (!isSemver(current) || !isSemver(latest)) return
  if (!semverGt(latest, current)) return

  const promptedRecently =
    cache?.promptedAt && Date.now() - cache.promptedAt < PROMPT_COOLDOWN_MS
  if (promptedRecently) return

  output.write(`\n\x1b[33m[swarm]\x1b[0m A newer version is available: \x1b[1m${current}\x1b[0m → \x1b[1m${latest}\x1b[0m\n`)
  output.write(
    `          Update now? [y/N] (set SWARM_SKIP_UPDATE_CHECK=1 to hide permanently)\n`,
  )

  const rl = createInterface({ input, output })
  try {
    const answer = (await rl.question('          ')).trim().toLowerCase()
    writeCache({
      ...(cache ?? { checkedAt: Date.now(), latest }),
      promptedAt: Date.now(),
    })
    if (answer !== 'y' && answer !== 'yes') {
      output.write('          Leaving your install as-is. Run whenever you\'re ready:\n')
      output.write(`          npm install -g ${PKG_NAME}@latest\n\n`)
      return
    }

    const upgradeOk = await new Promise<boolean>((resolve) => {
      const child = spawn('npm', ['install', '-g', `${PKG_NAME}@latest`], {
        stdio: 'inherit',
        shell: process.platform === 'win32',
        env: process.env,
      })
      child.on('error', (err) => {
        output.write(`          ${String(err)}\n`)
        resolve(false)
      })
      child.on('exit', (code) => {
        if (code !== 0) {
          output.write(
            `\n          npm exited with code ${code}. Try manually: npm install -g ${PKG_NAME}@latest\n`,
          )
        }
        resolve(code === 0)
      })
    })
    if (upgradeOk) {
      output.write('\n✓ Upgrade finished. Run `swarm` again.\n')
      process.exit(0)
    }
  } catch {
    output.write('\nCould not read your answer. Upgrade manually:\n')
    output.write(`  npm install -g ${PKG_NAME}@latest\n\n`)
  } finally {
    rl.close()
  }
}
