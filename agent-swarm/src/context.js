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
exports.getUserContext = exports.getSystemContext = exports.getGitStatus = void 0;
exports.getSystemPromptInjection = getSystemPromptInjection;
exports.setSystemPromptInjection = setSystemPromptInjection;
var bun_bundle_1 = require("bun:bundle");
var memoize_js_1 = require("lodash-es/memoize.js");
var state_js_1 = require("./bootstrap/state.js");
var common_js_1 = require("./constants/common.js");
var claudemd_js_1 = require("./utils/claudemd.js");
var diagLogs_js_1 = require("./utils/diagLogs.js");
var envUtils_js_1 = require("./utils/envUtils.js");
var execFileNoThrow_js_1 = require("./utils/execFileNoThrow.js");
var git_js_1 = require("./utils/git.js");
var gitSettings_js_1 = require("./utils/gitSettings.js");
var log_js_1 = require("./utils/log.js");
var MAX_STATUS_CHARS = 2000;
// System prompt injection for cache breaking (ant-only, ephemeral debugging state)
var systemPromptInjection = null;
function getSystemPromptInjection() {
    return systemPromptInjection;
}
function setSystemPromptInjection(value) {
    var _a, _b, _c, _d;
    systemPromptInjection = value;
    // Clear context caches immediately when injection changes
    (_b = (_a = exports.getUserContext.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
    (_d = (_c = exports.getSystemContext.cache).clear) === null || _d === void 0 ? void 0 : _d.call(_c);
}
exports.getGitStatus = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, isGitStart, isGit, gitCmdsStart, _a, branch, mainBranch, status_1, log, userName, truncatedStatus, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (process.env.NODE_ENV === 'test') {
                    // Avoid cycles in tests
                    return [2 /*return*/, null];
                }
                startTime = Date.now();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'git_status_started');
                isGitStart = Date.now();
                return [4 /*yield*/, (0, git_js_1.getIsGit)()];
            case 1:
                isGit = _b.sent();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'git_is_git_check_completed', {
                    duration_ms: Date.now() - isGitStart,
                    is_git: isGit,
                });
                if (!isGit) {
                    (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'git_status_skipped_not_git', {
                        duration_ms: Date.now() - startTime,
                    });
                    return [2 /*return*/, null];
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                gitCmdsStart = Date.now();
                return [4 /*yield*/, Promise.all([
                        (0, git_js_1.getBranch)(),
                        (0, git_js_1.getDefaultBranch)(),
                        (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'status', '--short'], {
                            preserveOutputOnError: false,
                        }).then(function (_a) {
                            var stdout = _a.stdout;
                            return stdout.trim();
                        }),
                        (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['--no-optional-locks', 'log', '--oneline', '-n', '5'], {
                            preserveOutputOnError: false,
                        }).then(function (_a) {
                            var stdout = _a.stdout;
                            return stdout.trim();
                        }),
                        (0, execFileNoThrow_js_1.execFileNoThrow)((0, git_js_1.gitExe)(), ['config', 'user.name'], {
                            preserveOutputOnError: false,
                        }).then(function (_a) {
                            var stdout = _a.stdout;
                            return stdout.trim();
                        }),
                    ])];
            case 3:
                _a = _b.sent(), branch = _a[0], mainBranch = _a[1], status_1 = _a[2], log = _a[3], userName = _a[4];
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'git_commands_completed', {
                    duration_ms: Date.now() - gitCmdsStart,
                    status_length: status_1.length,
                });
                truncatedStatus = status_1.length > MAX_STATUS_CHARS
                    ? status_1.substring(0, MAX_STATUS_CHARS) +
                        '\n... (truncated because it exceeds 2k characters. If you need more information, run "git status" using BashTool)'
                    : status_1;
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'git_status_completed', {
                    duration_ms: Date.now() - startTime,
                    truncated: status_1.length > MAX_STATUS_CHARS,
                });
                return [2 /*return*/, __spreadArray(__spreadArray([
                        "This is the git status at the start of the conversation. Note that this status is a snapshot in time, and will not update during the conversation.",
                        "Current branch: ".concat(branch),
                        "Main branch (you will usually use this for PRs): ".concat(mainBranch)
                    ], (userName ? ["Git user: ".concat(userName)] : []), true), [
                        "Status:\n".concat(truncatedStatus || '(clean)'),
                        "Recent commits:\n".concat(log),
                    ], false).join('\n\n')];
            case 4:
                error_1 = _b.sent();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('error', 'git_status_failed', {
                    duration_ms: Date.now() - startTime,
                });
                (0, log_js_1.logError)(error_1);
                return [2 /*return*/, null];
            case 5: return [2 /*return*/];
        }
    });
}); });
/**
 * This context is prepended to each conversation, and cached for the duration of the conversation.
 */
exports.getSystemContext = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, gitStatus, _a, injection;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                startTime = Date.now();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'system_context_started');
                if (!((0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_REMOTE) ||
                    !(0, gitSettings_js_1.shouldIncludeGitInstructions)())) return [3 /*break*/, 1];
                _a = null;
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, (0, exports.getGitStatus)()
                // Include system prompt injection if set (for cache breaking, ant-only)
            ];
            case 2:
                _a = _b.sent();
                _b.label = 3;
            case 3:
                gitStatus = _a;
                injection = (0, bun_bundle_1.feature)('BREAK_CACHE_COMMAND')
                    ? getSystemPromptInjection()
                    : null;
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'system_context_completed', {
                    duration_ms: Date.now() - startTime,
                    has_git_status: gitStatus !== null,
                    has_injection: injection !== null,
                });
                return [2 /*return*/, __assign(__assign({}, (gitStatus && { gitStatus: gitStatus })), ((0, bun_bundle_1.feature)('BREAK_CACHE_COMMAND') && injection
                        ? {
                            cacheBreaker: "[CACHE_BREAKER: ".concat(injection, "]"),
                        }
                        : {}))];
        }
    });
}); });
/**
 * This context is prepended to each conversation, and cached for the duration of the conversation.
 */
exports.getUserContext = (0, memoize_js_1.default)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, shouldDisableClaudeMd, claudeMd, _a, _b, _c;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                startTime = Date.now();
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'user_context_started');
                shouldDisableClaudeMd = (0, envUtils_js_1.isEnvTruthy)(process.env.CLAUDE_CODE_DISABLE_CLAUDE_MDS) ||
                    ((0, envUtils_js_1.isBareMode)() && (0, state_js_1.getAdditionalDirectoriesForClaudeMd)().length === 0);
                if (!shouldDisableClaudeMd) return [3 /*break*/, 1];
                _a = null;
                return [3 /*break*/, 3];
            case 1:
                _b = claudemd_js_1.getClaudeMds;
                _c = claudemd_js_1.filterInjectedMemoryFiles;
                return [4 /*yield*/, (0, claudemd_js_1.getMemoryFiles)()];
            case 2:
                _a = _b.apply(void 0, [_c.apply(void 0, [_e.sent()])]);
                _e.label = 3;
            case 3:
                claudeMd = _a;
                // Cache for the auto-mode classifier (yoloClassifier.ts reads this
                // instead of importing claudemd.ts directly, which would create a
                // cycle through permissions/filesystem → permissions → yoloClassifier).
                (0, state_js_1.setCachedClaudeMdContent)(claudeMd || null);
                (0, diagLogs_js_1.logForDiagnosticsNoPII)('info', 'user_context_completed', {
                    duration_ms: Date.now() - startTime,
                    claudemd_length: (_d = claudeMd === null || claudeMd === void 0 ? void 0 : claudeMd.length) !== null && _d !== void 0 ? _d : 0,
                    claudemd_disabled: Boolean(shouldDisableClaudeMd),
                });
                return [2 /*return*/, __assign(__assign({}, (claudeMd && { claudeMd: claudeMd })), { currentDate: "Today's date is ".concat((0, common_js_1.getLocalISODate)(), ".") })];
        }
    });
}); });
