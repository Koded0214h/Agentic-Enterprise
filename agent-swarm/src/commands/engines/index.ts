import type { Command } from '../../commands.js'

const engines = {
  type: 'local',
  name: 'engines',
  description: 'List all available swarm engines',
  supportsNonInteractive: true,
  load: () => import('./engines.js'),
} satisfies Command

export default engines
