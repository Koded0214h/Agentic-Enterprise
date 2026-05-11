import type { LocalCommandCall } from '../../types/command.js'

interface Todo {
  text: string
  done: boolean
}

const todos: Todo[] = []

export const call: LocalCommandCall = async (args) => {
  const text = args.trim()

  if (!text) {
    if (todos.length === 0) {
      return { type: 'text', value: 'No todos yet. Use /todo <text> to add one.' }
    }
    const lines = todos.map((t, i) => `${i + 1}. [${t.done ? 'x' : ' '}] ${t.text}`)
    return { type: 'text', value: `Session Todos:\n${lines.join('\n')}` }
  }

  const doneMatch = text.match(/^(?:done|check)\s+(\d+)$/i)
  if (doneMatch) {
    const idx = parseInt(doneMatch[1]!, 10) - 1
    if (idx < 0 || idx >= todos.length) {
      return { type: 'text', value: `No todo #${idx + 1}` }
    }
    todos[idx]!.done = true
    return { type: 'text', value: `Marked done: ${todos[idx]!.text}` }
  }

  todos.push({ text, done: false })
  return { type: 'text', value: `Added todo #${todos.length}: ${text}` }
}
