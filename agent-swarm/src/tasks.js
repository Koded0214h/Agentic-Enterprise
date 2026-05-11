"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTasks = getAllTasks;
exports.getTaskByType = getTaskByType;
var bun_bundle_1 = require("bun:bundle");
var DreamTask_js_1 = require("./tasks/DreamTask/DreamTask.js");
var LocalAgentTask_js_1 = require("./tasks/LocalAgentTask/LocalAgentTask.js");
var LocalShellTask_js_1 = require("./tasks/LocalShellTask/LocalShellTask.js");
var RemoteAgentTask_js_1 = require("./tasks/RemoteAgentTask/RemoteAgentTask.js");
/* eslint-disable @typescript-eslint/no-require-imports */
var LocalWorkflowTask = (0, bun_bundle_1.feature)('WORKFLOW_SCRIPTS')
    ? require('./tasks/LocalWorkflowTask/LocalWorkflowTask.js').LocalWorkflowTask
    : null;
var MonitorMcpTask = (0, bun_bundle_1.feature)('MONITOR_TOOL')
    ? require('./tasks/MonitorMcpTask/MonitorMcpTask.js').MonitorMcpTask
    : null;
/* eslint-enable @typescript-eslint/no-require-imports */
/**
 * Get all tasks.
 * Mirrors the pattern from tools.ts
 * Note: Returns array inline to avoid circular dependency issues with top-level const
 */
function getAllTasks() {
    var tasks = [
        LocalShellTask_js_1.LocalShellTask,
        LocalAgentTask_js_1.LocalAgentTask,
        RemoteAgentTask_js_1.RemoteAgentTask,
        DreamTask_js_1.DreamTask,
    ];
    if (LocalWorkflowTask)
        tasks.push(LocalWorkflowTask);
    if (MonitorMcpTask)
        tasks.push(MonitorMcpTask);
    return tasks;
}
/**
 * Get a task by its type.
 */
function getTaskByType(type) {
    return getAllTasks().find(function (t) { return t.type === type; });
}
