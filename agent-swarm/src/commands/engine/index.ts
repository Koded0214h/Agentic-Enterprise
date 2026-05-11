import type { Command } from '../../commands.js'

const engine = {
  type: 'local',
  name: 'engine',
  description: 'Show or set the current swarm engine',
  supportsNonInteractive: true,
  argumentHint: '[name]',
  load: () => import('./engine.js'),
} satisfies Command

export default engine
