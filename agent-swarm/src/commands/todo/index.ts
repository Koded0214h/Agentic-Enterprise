import type { Command } from '../../commands.js'

const todo = {
  type: 'local',
  name: 'todo',
  description: 'Manage todos in the current session',
  supportsNonInteractive: false,
  argumentHint: '[text | done <n>]',
  load: () => import('./todo.js'),
} satisfies Command

export default todo
