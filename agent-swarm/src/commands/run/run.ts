import type { LocalCommandCall } from '../../types/command.js'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { getSwarmPackageRoot } from '../../utils/swarmPackageRoot.js'

export const call: LocalCommandCall = async (args) => {
  const parts = args.trim().split(/\s+/)
  const agentName = parts[0]
  const task = parts.slice(1).join(' ')

  if (!agentName) {
    return { type: 'text', value: 'Usage: /run <agent> [task]\nProvide an agent name to run.' }
  }

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

  const agents = config.agents as Record<string, { file: string; engine: string | null; source: string }> | undefined

  if (!agents) {
    return { type: 'text', value: 'No agents found in swarm.config.json' }
  }

  if (!agents[agentName]) {
    const categories = new Set<string>()
    for (const key of Object.keys(agents)) {
      const source = agents[key]?.source
      if (source) categories.add(source)
    }
    const agentList = Object.keys(agents).slice(0, 20).join(', ')
    const more = Object.keys(agents).length > 20 ? ` ... and ${Object.keys(agents).length - 20} more` : ''
    return {
      type: 'text',
      value: `Agent "${agentName}" not found.\n\nAvailable categories: ${[...categories].join(', ')}\n\nSample agents: ${agentList}${more}\n\nRun /agents to see all available agents.`,
    }
  }

  const agent = agents[agentName]
  const engineName = agent.engine ?? (config.default_engine as string) ?? 'claude'
  const orchestratorPath = join(packageRoot, 'orchestrator.py')
  const taskArg = task ? ` "${task}"` : ''

  const lines = [
    `Agent: ${agentName}`,
    `File:  ${agent.file}`,
    `Engine: ${engineName}`,
    ``,
    `Run command:`,
    `  python3 ${orchestratorPath} --agent ${agentName}${taskArg} --project <project-path>`,
    ``,
    `Or set SWARM_ROOT and run:`,
    `  swarm --agent ${agentName}${taskArg}`,
  ]

  return { type: 'text', value: lines.join('\n') }
}
