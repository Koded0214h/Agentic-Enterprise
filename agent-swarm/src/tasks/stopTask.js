"use strict";
// Shared logic for stopping a running task.
// Used by TaskStopTool (LLM-invoked) and SDK stop_task control request.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.StopTaskError = void 0;
exports.stopTask = stopTask;
var tasks_js_1 = require("../tasks.js");
var sdkEventQueue_js_1 = require("../utils/sdkEventQueue.js");
var guards_js_1 = require("./LocalShellTask/guards.js");
var StopTaskError = /** @class */ (function (_super) {
    __extends(StopTaskError, _super);
    function StopTaskError(message, code) {
        var _this = _super.call(this, message) || this;
        _this.code = code;
        _this.name = 'StopTaskError';
        return _this;
    }
    return StopTaskError;
}(Error));
exports.StopTaskError = StopTaskError;
/**
 * Look up a task by ID, validate it is running, kill it, and mark it as notified.
 *
 * Throws {@link StopTaskError} when the task cannot be stopped (not found,
 * not running, or unsupported type). Callers can inspect `error.code` to
 * distinguish the failure reason.
 */
function stopTask(taskId, context) {
    return __awaiter(this, void 0, void 0, function () {
        var getAppState, setAppState, appState, task, taskImpl, suppressed_1, command;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    getAppState = context.getAppState, setAppState = context.setAppState;
                    appState = getAppState();
                    task = (_a = appState.tasks) === null || _a === void 0 ? void 0 : _a[taskId];
                    if (!task) {
                        throw new StopTaskError("No task found with ID: ".concat(taskId), 'not_found');
                    }
                    if (task.status !== 'running') {
                        throw new StopTaskError("Task ".concat(taskId, " is not running (status: ").concat(task.status, ")"), 'not_running');
                    }
                    taskImpl = (0, tasks_js_1.getTaskByType)(task.type);
                    if (!taskImpl) {
                        throw new StopTaskError("Unsupported task type: ".concat(task.type), 'unsupported_type');
                    }
                    return [4 /*yield*/, taskImpl.kill(taskId, setAppState)
                        // Bash: suppress the "exit code 137" notification (noise). Agent tasks: don't
                        // suppress — the AbortError catch sends a notification carrying
                        // extractPartialResult(agentMessages), which is the payload not noise.
                    ];
                case 1:
                    _b.sent();
                    // Bash: suppress the "exit code 137" notification (noise). Agent tasks: don't
                    // suppress — the AbortError catch sends a notification carrying
                    // extractPartialResult(agentMessages), which is the payload not noise.
                    if ((0, guards_js_1.isLocalShellTask)(task)) {
                        suppressed_1 = false;
                        setAppState(function (prev) {
                            var _a;
                            var prevTask = prev.tasks[taskId];
                            if (!prevTask || prevTask.notified) {
                                return prev;
                            }
                            suppressed_1 = true;
                            return __assign(__assign({}, prev), { tasks: __assign(__assign({}, prev.tasks), (_a = {}, _a[taskId] = __assign(__assign({}, prevTask), { notified: true }), _a)) });
                        });
                        // Suppressing the XML notification also suppresses print.ts's parsed
                        // task_notification SDK event — emit it directly so SDK consumers see
                        // the task close.
                        if (suppressed_1) {
                            (0, sdkEventQueue_js_1.emitTaskTerminatedSdk)(taskId, 'stopped', {
                                toolUseId: task.toolUseId,
                                summary: task.description,
                            });
                        }
                    }
                    command = (0, guards_js_1.isLocalShellTask)(task) ? task.command : task.description;
                    return [2 /*return*/, { taskId: taskId, taskType: task.type, command: command }];
            }
        });
    });
}
