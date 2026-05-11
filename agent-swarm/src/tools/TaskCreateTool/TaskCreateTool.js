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
exports.TaskCreateTool = void 0;
var v4_1 = require("zod/v4");
var Tool_js_1 = require("../../Tool.js");
var hooks_js_1 = require("../../utils/hooks.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var tasks_js_1 = require("../../utils/tasks.js");
var teammate_js_1 = require("../../utils/teammate.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        subject: v4_1.z.string().describe('A brief title for the task'),
        description: v4_1.z.string().describe('What needs to be done'),
        activeForm: v4_1.z
            .string()
            .optional()
            .describe('Present continuous form shown in spinner when in_progress (e.g., "Running tests")'),
        metadata: v4_1.z
            .record(v4_1.z.string(), v4_1.z.unknown())
            .optional()
            .describe('Arbitrary metadata to attach to the task'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        task: v4_1.z.object({
            id: v4_1.z.string(),
            subject: v4_1.z.string(),
        }),
    });
});
exports.TaskCreateTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.TASK_CREATE_TOOL_NAME,
    searchHint: 'create a task in the task list',
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
                return [2 /*return*/, (0, prompt_js_1.getPrompt)()];
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
        return 'TaskCreate';
    },
    shouldDefer: true,
    isEnabled: function () {
        return (0, tasks_js_1.isTodoV2Enabled)();
    },
    isConcurrencySafe: function () {
        return true;
    },
    toAutoClassifierInput: function (input) {
        return input.subject;
    },
    renderToolUseMessage: function () {
        return null;
    },
    call: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var taskId, blockingErrors, generator, _c, generator_1, generator_1_1, result, e_1_1;
            var _d, e_1, _e, _f;
            var _g;
            var subject = _b.subject, description = _b.description, activeForm = _b.activeForm, metadata = _b.metadata;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0: return [4 /*yield*/, (0, tasks_js_1.createTask)((0, tasks_js_1.getTaskListId)(), {
                            subject: subject,
                            description: description,
                            activeForm: activeForm,
                            status: 'pending',
                            owner: undefined,
                            blocks: [],
                            blockedBy: [],
                            metadata: metadata,
                        })];
                    case 1:
                        taskId = _h.sent();
                        blockingErrors = [];
                        generator = (0, hooks_js_1.executeTaskCreatedHooks)(taskId, subject, description, (0, teammate_js_1.getAgentName)(), (0, teammate_js_1.getTeamName)(), undefined, (_g = context === null || context === void 0 ? void 0 : context.abortController) === null || _g === void 0 ? void 0 : _g.signal, undefined, context);
                        _h.label = 2;
                    case 2:
                        _h.trys.push([2, 7, 8, 13]);
                        _c = true, generator_1 = __asyncValues(generator);
                        _h.label = 3;
                    case 3: return [4 /*yield*/, generator_1.next()];
                    case 4:
                        if (!(generator_1_1 = _h.sent(), _d = generator_1_1.done, !_d)) return [3 /*break*/, 6];
                        _f = generator_1_1.value;
                        _c = false;
                        result = _f;
                        if (result.blockingError) {
                            blockingErrors.push((0, hooks_js_1.getTaskCreatedHookMessage)(result.blockingError));
                        }
                        _h.label = 5;
                    case 5:
                        _c = true;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 13];
                    case 7:
                        e_1_1 = _h.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 13];
                    case 8:
                        _h.trys.push([8, , 11, 12]);
                        if (!(!_c && !_d && (_e = generator_1.return))) return [3 /*break*/, 10];
                        return [4 /*yield*/, _e.call(generator_1)];
                    case 9:
                        _h.sent();
                        _h.label = 10;
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 12: return [7 /*endfinally*/];
                    case 13:
                        if (!(blockingErrors.length > 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, (0, tasks_js_1.deleteTask)((0, tasks_js_1.getTaskListId)(), taskId)];
                    case 14:
                        _h.sent();
                        throw new Error(blockingErrors.join('\n'));
                    case 15:
                        // Auto-expand task list when creating tasks
                        context.setAppState(function (prev) {
                            if (prev.expandedView === 'tasks')
                                return prev;
                            return __assign(__assign({}, prev), { expandedView: 'tasks' });
                        });
                        return [2 /*return*/, {
                                data: {
                                    task: {
                                        id: taskId,
                                        subject: subject,
                                    },
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (content, toolUseID) {
        var task = content.task;
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: "Task #".concat(task.id, " created successfully: ").concat(task.subject),
        };
    },
});
