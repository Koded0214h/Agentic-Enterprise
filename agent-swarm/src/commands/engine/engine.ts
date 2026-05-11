import type { LocalCommandCall } from '../../types/command.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getSwarmPackageRoot } from '../../utils/swarmPackageRoot.js'

export const call: LocalCommandCall = async (args) => {
  const newEngine = args.trim()
  const packageRoot = getSwarmPackageRoot(import.meta.url)
  const configPath = join(packageRoot, 'swarm.config.json')

  if (!existsSync(configPath)) {
    return { type: 'text', value: `swarm.config.json not found at: ${configPath}` }
  }

  let config: Record<string, unknown>
  try {
    config = JSON.parse(readFileSync(configPath, 'utf8'))
  } catch {
    return { type: 'text', value: 'Failed to parse swarm.config.json' }
  }

  const currentEngine = (config.default_engine as string) ?? 'claude'

  if (!newEngine) {
    const enginesDir = join(packageRoot, 'engines')
    const knownEngines = ['claude', 'gemini', 'generic', 'openai', 'ollama']
    return {
      type: 'text',
      value: [
        `Current engine: ${currentEngine}`,
        ``,
        `Available engines: ${knownEngines.join(', ')}`,
        ``,
        `To change engine, edit ${configPath}`,
        `and set "default_engine" to your preferred engine.`,
        ``,
        `Or use: /engine <name>  — to see instructions for switching.`,
      ].join('\n'),
    }
  }

  return {
    type: 'text',
    value: [
      `To switch from "${currentEngine}" to "${newEngine}":`,
      ``,
      `Edit ${configPath}`,
      `Change: "default_engine": "${currentEngine}"`,
      `To:     "default_engine": "${newEngine}"`,
      ``,
      `Or set per-agent by adding "engine": "${newEngine}" to any agent entry.`,
    ].join('\n'),
  }
}
