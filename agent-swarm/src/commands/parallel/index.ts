import type { Command } from '../../commands.js'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/index.mjs'

const parallel: Command = {
  type: 'prompt',
  name: 'parallel',
  description: 'Describe how to run a task with parallel agents',
  contentLength: 0,
  progressMessage: 'planning parallel agent strategy',
  source: 'builtin',
  async getPromptForCommand(args): Promise<ContentBlockParam[]> {
    const task = args.trim() || 'the current task'
    return [
      {
        type: 'text',
        text: `I want to run the following task using multiple swarm agents in parallel:

Task: ${task}

Please help me:
1. Break this task into independent subtasks that can run in parallel
2. Suggest which specific swarm agents from the agent-swarm library would be best suited for each subtask (consider agents like: product-manager, engineer, qa-tester, security-reviewer, docs-writer, etc.)
3. Explain the dependencies between subtasks (what must run first vs. what can run in parallel)
4. Provide a concrete execution plan showing the parallel execution order
5. Estimate the efficiency gain from parallelization vs sequential execution

Format as a clear execution plan with agent assignments.`,
      },
    ]
  },
}

export default parallel
