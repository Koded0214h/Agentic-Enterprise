import type { LocalCommandCall } from '../../types/command.js'

let sessionGoal = ''

export const call: LocalCommandCall = async (args) => {
  const text = args.trim()

  if (!text) {
    if (!sessionGoal) {
      return { type: 'text', value: 'No session goal set. Use /goal <description> to set one.' }
    }
    return { type: 'text', value: `Current session goal:\n  ${sessionGoal}` }
  }

  sessionGoal = text
  return { type: 'text', value: `Session goal set:\n  ${sessionGoal}` }
}
