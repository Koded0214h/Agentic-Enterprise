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
exports.TaskGetTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var tasks_js_1 = require("../../utils/tasks.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        taskId: v4_1.z.string().describe('The ID of the task to retrieve'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        task: v4_1.z
            .object({
            id: v4_1.z.string(),
            subject: v4_1.z.string(),
            description: v4_1.z.string(),
            status: (0, tasks_js_1.TaskStatusSchema)(),
            blocks: v4_1.z.array(v4_1.z.string()),
            blockedBy: v4_1.z.array(v4_1.z.string()),
        })
            .nullable(),
    });
});
exports.TaskGetTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.TASK_GET_TOOL_NAME,
    searchHint: 'retrieve a task by ID',
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
        return 'TaskGet';
    },
    shouldDefer: true,
    isEnabled: function () {
        return (0, tasks_js_1.isTodoV2Enabled)();
    },
    isConcurrencySafe: function () {
        return true;
    },
    isReadOnly: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return input.taskId;
    },
    renderToolUseMessage: function () {
        return null;
    },
    call: function (_a) {
        return __awaiter(this, arguments, void 0, function (_b) {
            var taskListId, task;
            var taskId = _b.taskId;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        taskListId = (0, tasks_js_1.getTaskListId)();
                        return [4 /*yield*/, (0, tasks_js_1.getTask)(taskListId, taskId)];
                    case 1:
                        task = _c.sent();
                        if (!task) {
                            return [2 /*return*/, {
                                    data: {
                                        task: null,
                                    },
                                }];
                        }
                        return [2 /*return*/, {
                                data: {
                                    task: {
                                        id: task.id,
                                        subject: task.subject,
                                        description: task.description,
                                        status: task.status,
                                        blocks: task.blocks,
                                        blockedBy: task.blockedBy,
                                    },
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        var task = content.task;
        if (!task) {
            return {
                tool_use_id: toolUseID,
                type: 'tool_result',
                content: 'Task not found',
            };
        }
        var lines = [
            "Task #".concat(task.id, ": ").concat(task.subject),
            "Status: ".concat(task.status),
            "Description: ".concat(task.description),
        ];
        if (task.blockedBy.length > 0) {
            lines.push("Blocked by: ".concat(task.blockedBy.map(function (id) { return "#".concat(id); }).join(', ')));
        }
        if (task.blocks.length > 0) {
            lines.push("Blocks: ".concat(task.blocks.map(function (id) { return "#".concat(id); }).join(', ')));
        }
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: lines.join('\n'),
        };
    },
});
