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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoWriteTool = void 0;
var bun_bundle_1 = require("bun:bundle");
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var growthbook_js_1 = require("../../services/analytics/growthbook.js");
var Tool_js_1 = require("../../Tool.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var tasks_js_1 = require("../../utils/tasks.js");
var types_js_1 = require("../../utils/todo/types.js");
var constants_js_1 = require("../AgentTool/constants.js");
var constants_js_2 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        todos: (0, types_js_1.TodoListSchema)().describe('The updated todo list'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        oldTodos: (0, types_js_1.TodoListSchema)().describe('The todo list before the update'),
        newTodos: (0, types_js_1.TodoListSchema)().describe('The todo list after the update'),
        verificationNudgeNeeded: v4_1.z.boolean().optional(),
    });
});
exports.TodoWriteTool = (0, Tool_js_1.buildTool)({
    name: constants_js_2.TODO_WRITE_TOOL_NAME,
    searchHint: 'manage the session task checklist',
    maxResultSizeChars: 100000,
    strict: true,
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
        return '';
    },
    shouldDefer: true,
    isEnabled: function () {
        return !(0, tasks_js_1.isTodoV2Enabled)();
    },
    toAutoClassifierInput: function (input) {
        return "".concat(input.todos.length, " items");
    },
    checkPermissions: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // No permission checks required for todo operations
                return [2 /*return*/, { behavior: 'allow', updatedInput: input }];
            });
        });
    },
    renderToolUseMessage: function () {
        return null;
    },
    call: function (_a, context_1) {
        return __awaiter(this, arguments, void 0, function (_b, context) {
            var appState, todoKey, oldTodos, allDone, newTodos, verificationNudgeNeeded;
            var _c, _d;
            var todos = _b.todos;
            return __generator(this, function (_e) {
                appState = context.getAppState();
                todoKey = (_c = context.agentId) !== null && _c !== void 0 ? _c : (0, state_js_1.getSessionId)();
                oldTodos = (_d = appState.todos[todoKey]) !== null && _d !== void 0 ? _d : [];
                allDone = todos.every(function (_) { return _.status === 'completed'; });
                newTodos = allDone ? [] : todos;
                verificationNudgeNeeded = false;
                if ((0, bun_bundle_1.feature)('VERIFICATION_AGENT') &&
                    (0, growthbook_js_1.getFeatureValue_CACHED_MAY_BE_STALE)('tengu_hive_evidence', false) &&
                    !context.agentId &&
                    allDone &&
                    todos.length >= 3 &&
                    !todos.some(function (t) { return /verif/i.test(t.content); })) {
                    verificationNudgeNeeded = true;
                }
                context.setAppState(function (prev) {
                    var _a;
                    return (__assign(__assign({}, prev), { todos: __assign(__assign({}, prev.todos), (_a = {}, _a[todoKey] = newTodos, _a)) }));
                });
                return [2 /*return*/, {
                        data: {
                            oldTodos: oldTodos,
                            newTodos: todos,
                            verificationNudgeNeeded: verificationNudgeNeeded,
                        },
                    }];
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var verificationNudgeNeeded = _a.verificationNudgeNeeded;
        var base = "Todos have been modified successfully. Ensure that you continue to use the todo list to track your progress. Please proceed with the current tasks if applicable";
        var nudge = verificationNudgeNeeded
            ? "\n\nNOTE: You just closed out 3+ tasks and none of them was a verification step. Before writing your final summary, spawn the verification agent (subagent_type=\"".concat(constants_js_1.VERIFICATION_AGENT_TYPE, "\"). You cannot self-assign PARTIAL by listing caveats in your summary \u2014 only the verifier issues a verdict.")
            : '';
        return {
            tool_use_id: toolUseID,
            type: 'tool_result',
            content: base + nudge,
        };
    },
});
