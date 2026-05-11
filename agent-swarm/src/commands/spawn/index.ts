import type { Command } from '../../commands.js'

const spawn = {
  type: 'local',
  name: 'spawn',
  description: 'Spawn a swarm agent as a background sub-task',
  supportsNonInteractive: true,
  argumentHint: '<agent> [task]',
  load: () => import('./spawn.js'),
} satisfies Command

export default spawn
