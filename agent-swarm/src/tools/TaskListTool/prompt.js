"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DESCRIPTION = void 0;
exports.getPrompt = getPrompt;
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
exports.DESCRIPTION = 'List all tasks in the task list';
function getPrompt() {
    var teammateUseCase = (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()
        ? "- Before assigning tasks to teammates, to see what's available\n"
        : '';
    var idDescription = (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()
        ? '- **id**: Task identifier (use with TaskGet, TaskUpdate)'
        : '- **id**: Task identifier (use with TaskGet, TaskUpdate)';
    var teammateWorkflow = (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()
        ? "\n## Teammate Workflow\n\nWhen working as a teammate:\n1. After completing your current task, call TaskList to find available work\n2. Look for tasks with status 'pending', no owner, and empty blockedBy\n3. **Prefer tasks in ID order** (lowest ID first) when multiple tasks are available, as earlier tasks often set up context for later ones\n4. Claim an available task using TaskUpdate (set `owner` to your name), or wait for leader assignment\n5. If blocked, focus on unblocking tasks or notify the team lead\n"
        : '';
    return "Use this tool to list all tasks in the task list.\n\n## When to Use This Tool\n\n- To see what tasks are available to work on (status: 'pending', no owner, not blocked)\n- To check overall progress on the project\n- To find tasks that are blocked and need dependencies resolved\n".concat(teammateUseCase, "- After completing a task, to check for newly unblocked work or claim the next available task\n- **Prefer working on tasks in ID order** (lowest ID first) when multiple tasks are available, as earlier tasks often set up context for later ones\n\n## Output\n\nReturns a summary of each task:\n").concat(idDescription, "\n- **subject**: Brief description of the task\n- **status**: 'pending', 'in_progress', or 'completed'\n- **owner**: Agent ID if assigned, empty if available\n- **blockedBy**: List of open task IDs that must be resolved first (tasks with blockedBy cannot be claimed until dependencies resolve)\n\nUse TaskGet with a specific task ID to view full details including description and comments.\n").concat(teammateWorkflow);
}
