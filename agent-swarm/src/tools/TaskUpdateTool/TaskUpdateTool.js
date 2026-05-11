"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskUpdateTool = void 0;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var Tool_js_1 = require("../../Tool.js");
var agentSwarmsEnabled_js_1 = require("../../utils/agentSwarmsEnabled.js");
var hooks_js_1 = require("../../utils/hooks.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var tasks_js_1 = require("../../utils/tasks.js");
var teammate_js_1 = require("../../utils/teammate.js");
var teammateMailbox_js_1 = require("../../utils/teammateMailbox.js");
var constants_js_1 = require("../AgentTool/constants.js");
var constants_js_2 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    // Extended status schema that includes 'deleted' as a special action
    var TaskUpdateStatusSchema = (0, tasks_js_1.TaskStatusSchema)().or(v4_1.z.literal('deleted'));
    return v4_1.z.strictObject({
        taskId: v4_1.z.string().describe('The ID of the task to update'),
        subject: v4_1.z.string().optional().describe('New subject for the task'),
        description: v4_1.z.string().optional().describe('New description for the task'),
        activeForm: v4_1.z
            .string()
            .optional()
            .describe('Present continuous form shown in spinner when in_progress (e.g., "Running tests")'),
        status: TaskUpdateStatusSchema.optional().describe('New status for the task'),
        addBlocks: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Task IDs that this task blocks'),
        addBlockedBy: v4_1.z
            .array(v4_1.z.string())
            .optional()
            .describe('Task IDs that block this task'),
        owner: v4_1.z.string().optional().describe('New owner for the task'),
        metadata: v4_1.z
            .record(v4_1.z.string(), v4_1.z.unknown())
            .optional()
            .describe('Metadata keys to merge into the task. Set a key to null to delete it.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        success: v4_1.z.boolean(),
        taskId: v4_1.z.string(),
        updatedFields: v4_1.z.array(v4_1.z.string()),
        error: v4_1.z.string().optional(),
        statusChange: v4_1.z
            .object({
            from: v4_1.z.string(),
            to: v4_1.z.string(),
        })
            .optional(),
        verificationNudgeNeeded: v4_1.z.boolean().optional(),
    });
});
exports.TaskUpdateTool = (0, Tool_js_1.buildTool)({
    name: constants_js_2.TASK_UPDATE_TOOL_NAME,
    searchHint: 'update a task',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.PROMPT];
            });
        });
    },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    userFacingName: function () {
        return 'TaskUpdate';
    },
    shouldDefer: true,
    isEnabled: function () {
        return (0, tasks_js_1.isTodoV2Enabled)();
    },
    isConcurrencySafe: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        var parts = [input.taskId];
        if (input.status)
            parts.push(input.status);
        if (input.subject)
            parts.push(input.subject);
        return parts.join(' ');
    },
    renderToolUseMessage: function () {
        return null;
    },
    call: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var taskListId, existingTask, updatedFields, updates, agentName, merged, _i, _c, _d, key, value, deleted, blockingErrors, generator, _e, generator_1, generator_1_1, result, e_1_1, senderName, senderColor, assignmentMessage, newBlocks, _f, newBlocks_1, blockId, newBlockedBy, _g, newBlockedBy_1, blockerId, verificationNudgeNeeded, allTasks, allDone;
            var _h, e_1, _j, _k;
            var _l, _m;
            var taskId = _b.taskId, subject = _b.subject, description = _b.description, activeForm = _b.activeForm, status = _b.status, owner = _b.owner, addBlocks = _b.addBlocks, addBlockedBy = _b.addBlockedBy, metadata = _b.metadata;
            return __generator(this, function (_o) {
                switch (_o.label) {
                    case 0:
                        taskListId = (0, tasks_js_1.getTaskListId)();
                        // Auto-expand task list when updating tasks
                        context.setAppState(function (prev) {
                            if (prev.expandedView === 'tasks')
                                return prev;
                            return __assign(__assign({}, prev), { expandedView: 'tasks' });
                        });
                        return [4 /*yield*/, (0, tasks_js_1.getTask)(taskListId, taskId)];
                    case 1:
                        existingTask = _o.sent();
                        if (!existingTask) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        taskId: taskId,
                                        updatedFields: [],
                                        error: 'Task not found',
                                    },
                                }];
                        }
                        updatedFields = [];
                        updates = {};
                        if (subject !== undefined && subject !== existingTask.subject) {
                            updates.subject = subject;
                            updatedFields.push('subject');
                        }
                        if (description !== undefined && description !== existingTask.description) {
                            updates.description = description;
                            updatedFields.push('description');
                        }
                        if (activeForm !== undefined && activeForm !== existingTask.activeForm) {
                            updates.activeForm = activeForm;
                            updatedFields.push('activeForm');
                        }
                        if (owner !== undefined && owner !== existingTask.owner) {
                            updates.owner = owner;
                            updatedFields.push('owner');
                        }
                        // Auto-set owner when a teammate marks a task as in_progress without
                        // explicitly providing an owner. This ensures the task list can match
                        // todo items to teammates for showing activity status.
                        if ((0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)() &&
                            status === 'in_progress' &&
                            owner === undefined &&
                            !existingTask.owner) {
                            agentName = (0, teammate_js_1.getAgentName)();
                            if (agentName) {
                                updates.owner = agentName;
                                updatedFields.push('owner');
                            }
                        }
                        if (metadata !== undefined) {
                            merged = __assign({}, ((_l = existingTask.metadata) !== null && _l !== void 0 ? _l : {}));
                            for (_i = 0, _c = Object.entries(metadata); _i < _c.length; _i++) {
                                _d = _c[_i], key = _d[0], value = _d[1];
                                if (value === null) {
                                    delete merged[key];
                                }
                                else {
                                    merged[key] = value;
                                }
                            }
                            updates.metadata = merged;
                            updatedFields.push('metadata');
                        }
                        if (!(status !== undefined)) return [3 /*break*/, 17];
                        if (!(status === 'deleted')) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, tasks_js_1.deleteTask)(taskListId, taskId)];
                    case 2:
                        deleted = _o.sent();
                        return [2 /*return*/, {
                                data: {
                                    success: deleted,
                                    taskId: taskId,
                                    updatedFields: deleted ? ['deleted'] : [],
                                    error: deleted ? undefined : 'Failed to delete task',
                                    statusChange: deleted
                                        ? { from: existingTask.status, to: 'deleted' }
                                        : undefined,
                                },
                            }];
                    case 3:
                        if (!(status !== existingTask.status)) return [3 /*break*/, 17];
                        if (!(status === 'completed')) return [3 /*break*/, 16];
                        blockingErrors = [];
                        generator = (0, hooks_js_1.executeTaskCompletedHooks)(taskId, existingTask.subject, existingTask.description, (0, teammate_js_1.getAgentName)(), (0, teammate_js_1.getTeamName)(), undefined, (_m = context === null || context === void 0 ? void 0 : context.abortController) === null || _m === void 0 ? void 0 : _m.signal, undefined, context);
                        _o.label = 4;
                    case 4:
                        _o.trys.push([4, 9, 10, 15]);
                        _e = true, generator_1 = __asyncValues(generator);
                        _o.label = 5;
                    case 5: return [4 /*yield*/, generator_1.next()];
                    case 6:
                        if (!(generator_1_1 = _o.sent(), _h = generator_1_1.done, !_h)) return [3 /*break*/, 8];
                        _k = generator_1_1.value;
                        _e = false;
                        result = _k;
                        if (result.blockingError) {
                            blockingErrors.push((0, hooks_js_1.getTaskCompletedHookMessage)(result.blockingError));
                        }
                        _o.label = 7;
                    case 7:
                        _e = true;
                        return [3 /*break*/, 5];
                    case 8: return [3 /*break*/, 15];
                    case 9:
                        e_1_1 = _o.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 15];
                    case 10:
                        _o.trys.push([10, , 13, 14]);
                        if (!(!_e && !_h && (_j = generator_1.return))) return [3 /*break*/, 12];
                        return [4 /*yield*/, _j.call(generator_1)];
                    case 11:
                        _o.sent();
                        _o.label = 12;
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 14: return [7 /*endfinally*/];
                    case 15:
                        if (blockingErrors.length > 0) {
                            return [2 /*return*/, {
                                    data: {
                                        success: false,
                                        taskId: taskId,
                                        updatedFields: [],
                                        error: blockingErrors.join('\n'),
                                    },
                                }];
                        }
                        _o.label = 16;
                    case 16:
                        updates.status = status;
                        updatedFields.push('status');
                        _o.label = 17;
                    case 17:
                        if (!(Object.keys(updates).length > 0)) return [3 /*break*/, 19];
                        return [4 /*yield*/, (0, tasks_js_1.updateTask)(taskListId, taskId, updates)];
                    case 18:
                        _o.sent();
                        _o.label = 19;
                    case 19:
                        if (!(updates.owner && (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)())) return [3 /*break*/, 21];
                        senderName = (0, teammate_js_1.getAgentName)() || 'team-lead';
                        senderColor = (0, teammate_js_1.getTeammateColor)();
                        assignmentMessage = JSON.stringify({
                            type: 'task_assignment',
                            taskId: taskId,
                            subject: existingTask.subject,
                            description: existingTask.description,
                            assignedBy: senderName,
                            timestamp: new Date().toISOString(),
                        });
                        return [4 /*yield*/, (0, teammateMailbox_js_1.writeToMailbox)(updates.owner, {
                                from: senderName,
                                text: assignmentMessage,
                                timestamp: new Date().toISOString(),
                                color: senderColor,
                            }, taskListId)];
                    case 20:
                        _o.sent();
                        _o.label = 21;
                    case 21:
                        if (!(addBlocks && addBlocks.length > 0)) return [3 /*break*/, 26];
                        newBlocks = addBlocks.filter(function (id) { return !existingTask.blocks.includes(id); });
                        _f = 0, newBlocks_1 = newBlocks;
                        _o.label = 22;
                    case 22:
                        if (!(_f < newBlocks_1.length)) return [3 /*break*/, 25];
                        blockId = newBlocks_1[_f];
                        return [4 /*yield*/, (0, tasks_js_1.blockTask)(taskListId, taskId, blockId)];
                    case 23:
                        _o.sent();
                        _o.label = 24;
                    case 24:
                        _f++;
                        return [3 /*break*/, 22];
                    case 25:
                        if (newBlocks.length > 0) {
                            updatedFields.push('blocks');
                        }
                        _o.label = 26;
                    case 26:
                        if (!(addBlockedBy && addBlockedBy.length > 0)) return [3 /*break*/, 31];
                        newBlockedBy = addBlockedBy.filter(function (id) { return !existingTask.blockedBy.includes(id); });
                        _g = 0, newBlockedBy_1 = newBlockedBy;
                        _o.label = 27;
                    case 27:
                        if (!(_g < newBlockedBy_1.length)) return [3 /*break*/, 30];
                        blockerId = newBlockedBy_1[_g];
                        return [4 /*yield*/, (0, tasks_js_1.blockTask)(taskListId, blockerId, taskId)];
                    case 28:
                        _o.sent();
                        _o.label = 29;
                    case 29:
                        _g++;
                        return [3 /*break*/, 27];
                    case 30:
                        if (newBlockedBy.length > 0) {
                            updatedFields.push('blockedBy');
                        }
                        _o.label = 31;
                    case 31:
                        verificationNudgeNeeded = false;
                        if (!((0, bun_bundle_1.feature)('VERIFICATION_AGENT') &&
                            (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_hive_evidence', false) &&
                            !context.agentId &&
                            updates.status === 'completed')) return [3 /*break*/, 33];
                        return [4 /*yield*/, (0, tasks_js_1.listTasks)(taskListId)];
                    case 32:
                        allTasks = _o.sent();
                        allDone = allTasks.every(function (t) { return t.status === 'completed'; });
                        if (allDone &&
                            allTasks.length >= 3 &&
                            !allTasks.some(function (t) { return /verif/i.test(t.subject); })) {
                            verificationNudgeNeeded = true;
                        }
                        _o.label = 33;
                    case 33: return [2 /*return*/, {
                            data: {
                                success: true,
                                taskId: taskId,
                                updatedFields: updatedFields,
                                statusChange: updates.status !== undefined
                                    ? { from: existingTask.status, to: updates.status }
                                    : undefined,
                                verificationNudgeNeeded: verificationNudgeNeeded,
                            },
                        }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        var _a = content, success = _a.success, taskId = _a.taskId, updatedFields = _a.updatedFields, error = _a.error, statusChange = _a.statusChange, verificationNudgeNeeded = _a.verificationNudgeNeeded;
        if (!success) {
            // Return as non-error so it doesn't trigger sibling tool cancellation
            // in StreamingToolExecutor. "Task not found" is a benign condition
            // (e.g., task list already cleaned up) that the model can handle.
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: error || "Task #".concat(taskId, " not found"),
            };
        }
        var resultContent = "Updated task #".concat(taskId, " ").concat(updatedFields.join(', '));
        // Add reminder for teammates when they complete a task (supports in-process teammates)
        if ((statusChange === null || statusChange === void 0 ? void 0 : statusChange.to) === 'completed' &&
            (0, teammate_js_1.getAgentId)() &&
            (0, agentSwarmsEnabled_js_1.isAgentSwarmsEnabled)()) {
            resultContent +=
                '\n\nTask completed. Call TaskList now to find your next available task or see if your work unblocked others.';
        }
        if (verificationNudgeNeeded) {
            resultContent += "\n\nNOTE: You just closed out 3+ tasks and none of them was a verification step. Before writing your final summary, spawn the verification agent (subagent_type=\"".concat(constants_js_1.VERIFICATION_AGENT_TYPE, "\"). You cannot self-assign PARTIAL by listing caveats in your summary \u2014 only the verifier issues a verdict.");
        }
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: resultContent,
        };
    },
});
