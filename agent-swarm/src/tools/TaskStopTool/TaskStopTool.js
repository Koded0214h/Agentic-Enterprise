"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStopTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var stopTask_js_1 = require("../../tasks/stopTask.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var slowOperations_js_1 = require("../../utils/slowOperations.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        task_id: v4_1.z
            .string()
            .optional()
            .describe('The ID of the background task to stop'),
        // shell_id is accepted for backward compatibility with the deprecated KillShell tool
        shell_id: v4_1.z.string().optional().describe('Deprecated: use task_id instead'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        message: v4_1.z.string().describe('Status message about the operation'),
        task_id: v4_1.z.string().describe('The ID of the task that was stopped'),
        task_type: v4_1.z.string().describe('The type of the task that was stopped'),
        // Optional: tool outputs are persisted to transcripts and replayed on --resume
        // without re-validation, so sessions from before this field was added lack it.
        command: v4_1.z
            .string()
            .optional()
            .describe('The command or description of the stopped task'),
    });
});
exports.TaskStopTool = (0, Tool_js_1.buildTool)({
    name: prompt_js_1.TASK_STOP_TOOL_NAME,
    searchHint: 'kill a running background task',
    // KillShell is the deprecated name - kept as alias for backward compatibility
    // with existing transcripts and SDK users
    aliases: ['KillShell'],
    maxResultSizeChars: 100000,
    userFacingName: function () { return (process.env.USER_TYPE === 'ant' ? '' : 'Stop Task'); },
    get inputSchema() {
        return inputSchema();
    },
    get outputSchema() {
        return outputSchema();
    },
    shouldDefer: true,
    isConcurrencySafe: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        var _a, _b;
        return (_b = (_a = input.task_id) !== null && _a !== void 0 ? _a : input.shell_id) !== null && _b !== void 0 ? _b : '';
    },
    validateInput: function (_a, _b) {
        return __awaiter(this, arguments, void 0, function (_c, _d) {
            var id, appState, task;
            var _e;
            var task_id = _c.task_id, shell_id = _c.shell_id;
            var getAppState = _d.getAppState;
            return __generator(this, function (_f) {
                id = task_id !== null && task_id !== void 0 ? task_id : shell_id;
                if (!id) {
                    return [2 /*return*/, {
                            result: false,
                            message: 'Missing required parameter: task_id',
                            errorCode: 1,
                        }];
                }
                appState = getAppState();
                task = (_e = appState.tasks) === null || _e === void 0 ? void 0 : _e[id];
                if (!task) {
                    return [2 /*return*/, {
                            result: false,
                            message: "No task found with ID: ".concat(id),
                            errorCode: 1,
                        }];
                }
                if (task.status !== 'running') {
                    return [2 /*return*/, {
                            result: false,
                            message: "Task ".concat(id, " is not running (status: ").concat(task.status, ")"),
                            errorCode: 3,
                        }];
                }
                return [2 /*return*/, { result: true }];
            });
        });
    },
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, "Stop a running background task by ID"];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prompt_js_1.DESCRIPTION];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (output, toolUseID) {
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: (0, slowOperations_js_1.jsonStringify)(output),
        };
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    call: function (_a, _b) {
        return __awaiter(this, arguments, void 0, function (_c, _d) {
            var id, result;
            var task_id = _c.task_id, shell_id = _c.shell_id;
            var getAppState = _d.getAppState, setAppState = _d.setAppState, abortController = _d.abortController;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        id = task_id !== null && task_id !== void 0 ? task_id : shell_id;
                        if (!id) {
                            throw new Error('Missing required parameter: task_id');
                        }
                        return [4 /*yield*/, (0, stopTask_js_1.stopTask)(id, {
                                getAppState: getAppState,
                                setAppState: setAppState,
                            })];
                    case 1:
                        result = _e.sent();
                        return [2 /*return*/, {
                                data: {
                                    message: "Successfully stopped task: ".concat(result.taskId, " (").concat(result.command, ")"),
                                    task_id: result.taskId,
                                    task_type: result.taskType,
                                    command: result.command,
                                },
                            }];
                }
            });
        });
    },
});
