import type { LocalCommandCall } from '../../types/command.js'
import { join } from 'path'
import { getSwarmPackageRoot } from '../../utils/swarmPackageRoot.js'

export const call: LocalCommandCall = async (args) => {
  const parts = args.trim().split(/\s+/)
  const agentName = parts[0]
  const task = parts.slice(1).join(' ')

  if (!agentName) {
    return { type: 'text', value: 'Usage: /spawn <agent> [task]\nProvide an agent name to spawn.' }
  }

  const packageRoot = getSwarmPackageRoot(import.meta.url)
  const orchestratorPath = join(packageRoot, 'orchestrator.py')
  const taskArg = task ? ` "${task}"` : ''
  const timestamp = new Date().toISOString()

  const lines = [
    `[${timestamp}] Spawning agent: ${agentName}`,
    '',
    'To run this agent in the background:',
    `  python3 ${orchestratorPath} --agent ${agentName}${taskArg} --project <project-path> &`,
    '',
    'Or in a new terminal:',
    `  SWARM_ROOT=${packageRoot} python3 ${orchestratorPath} --agent ${agentName}${taskArg}`,
    '',
    'Note: Use /run to see agent details before spawning.',
  ]

  return { type: 'text', value: lines.join('\n') }
}
