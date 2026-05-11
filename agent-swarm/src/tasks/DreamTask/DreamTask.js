"use strict";
// Background task entry for auto-dream (memory consolidation subagent).
// Makes the otherwise-invisible forked agent visible in the footer pill and
// Shift+Down dialog. The dream agent itself is unchanged — this is pure UI
// surfacing via the existing task registry.
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DreamTask = void 0;
exports.isDreamTask = isDreamTask;
exports.registerDreamTask = registerDreamTask;
exports.addDreamTurn = addDreamTurn;
exports.completeDreamTask = completeDreamTask;
exports.failDreamTask = failDreamTask;
var consolidationLock_js_1 = require("../../services/autoDream/consolidationLock.js");
var Task_js_1 = require("../../Task.js");
var framework_js_1 = require("../../utils/task/framework.js");
// Keep only the N most recent turns for live display.
var MAX_TURNS = 30;
function isDreamTask(task) {
    return (typeof task === 'object' &&
        task !== null &&
        'type' in task &&
        task.type === 'dream');
}
function registerDreamTask(setAppState, opts) {
    var id = (0, Task_js_1.generateTaskId)('dream');
    var task = __assign(__assign({}, (0, Task_js_1.createTaskStateBase)(id, 'dream', 'dreaming')), { type: 'dream', status: 'running', phase: 'starting', sessionsReviewing: opts.sessionsReviewing, filesTouched: [], turns: [], abortController: opts.abortController, priorMtime: opts.priorMtime });
    (0, framework_js_1.registerTask)(task, setAppState);
    return id;
}
function addDreamTurn(taskId, turn, touchedPaths, setAppState) {
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) {
        var seen = new Set(task.filesTouched);
        var newTouched = touchedPaths.filter(function (p) { return !seen.has(p) && seen.add(p); });
        // Skip the update entirely if the turn is empty AND nothing new was
        // touched. Avoids re-rendering on pure no-ops.
        if (turn.text === '' &&
            turn.toolUseCount === 0 &&
            newTouched.length === 0) {
            return task;
        }
        return __assign(__assign({}, task), { phase: newTouched.length > 0 ? 'updating' : task.phase, filesTouched: newTouched.length > 0
                ? __spreadArray(__spreadArray([], task.filesTouched, true), newTouched, true) : task.filesTouched, turns: task.turns.slice(-(MAX_TURNS - 1)).concat(turn) });
    });
}
function completeDreamTask(taskId, setAppState) {
    // notified: true immediately — dream has no model-facing notification path
    // (it's UI-only), and eviction requires terminal + notified. The inline
    // appendSystemMessage completion note IS the user surface.
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) { return (__assign(__assign({}, task), { status: 'completed', endTime: Date.now(), notified: true, abortController: undefined })); });
}
function failDreamTask(taskId, setAppState) {
    (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) { return (__assign(__assign({}, task), { status: 'failed', endTime: Date.now(), notified: true, abortController: undefined })); });
}
exports.DreamTask = {
    name: 'DreamTask',
    type: 'dream',
    kill: function (taskId, setAppState) {
        return __awaiter(this, void 0, void 0, function () {
            var priorMtime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        (0, framework_js_1.updateTaskState)(taskId, setAppState, function (task) {
                            var _a;
                            if (task.status !== 'running')
                                return task;
                            (_a = task.abortController) === null || _a === void 0 ? void 0 : _a.abort();
                            priorMtime = task.priorMtime;
                            return __assign(__assign({}, task), { status: 'killed', endTime: Date.now(), notified: true, abortController: undefined });
                        });
                        if (!(priorMtime !== undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, consolidationLock_js_1.rollbackConsolidationLock)(priorMtime)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    },
};
