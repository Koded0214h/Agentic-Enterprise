import type { LocalCommandCall } from '../../types/command.js'
import { existsSync } from 'fs'
import { join } from 'path'
import { getSwarmPackageRoot } from '../../utils/swarmPackageRoot.js'
import { spawnSync } from 'child_process'

const KNOWN_ENGINES = [
  { name: 'claude', command: 'claude', description: 'Anthropic Claude (via Claude Code)' },
  { name: 'gemini', command: 'gemini', description: 'Google Gemini CLI' },
  { name: 'generic', command: 'llm', description: 'Generic LLM adapter' },
  { name: 'openai', command: 'openai', description: 'OpenAI API adapter' },
  { name: 'ollama', command: 'ollama', description: 'Local Ollama models' },
]

function checkAvailable(command: string): boolean {
  try {
    const result = spawnSync('which', [command], { encoding: 'utf8' })
    return result.status === 0
  } catch {
    return false
  }
}

export const call: LocalCommandCall = async () => {
  const packageRoot = getSwarmPackageRoot(import.meta.url)
  const adapterPath = join(packageRoot, 'engines', 'adapter.py')
  const hasAdapter = existsSync(adapterPath)

  const lines: string[] = [
    'Available Swarm Engines',
    '='.repeat(50),
    '',
    `${'Name'.padEnd(12)}${'Command'.padEnd(12)}${'Status'.padEnd(14)}Description`,
    '-'.repeat(70),
  ]

  for (const eng of KNOWN_ENGINES) {
    const available = checkAvailable(eng.command)
    const status = available ? 'available' : 'not found'
    lines.push(`${eng.name.padEnd(12)}${eng.command.padEnd(12)}${status.padEnd(14)}${eng.description}`)
  }

  lines.push('')
  if (hasAdapter) {
    lines.push(`Engine adapter: ${adapterPath}`)
  }
  lines.push('Use /engine [name] to see instructions for switching engines.')

  return { type: 'text', value: lines.join('\n') }
}
