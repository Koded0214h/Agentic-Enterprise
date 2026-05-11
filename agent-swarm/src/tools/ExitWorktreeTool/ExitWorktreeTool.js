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
exports.ExitWorktreeTool = void 0;
var v4_1 = require("zod/v4");
var state_js_1 = require("../../bootstrap/state.js");
var systemPromptSections_js_1 = require("../../constants/systemPromptSections.js");
var index_js_1 = require("../../services/analytics/index.js");
var Tool_js_1 = require("../../Tool.js");
var array_js_1 = require("../../utils/array.js");
var claudemd_js_1 = require("../../utils/claudemd.js");
var execFileNoThrow_js_1 = require("../../utils/execFileNoThrow.js");
var hooksConfigSnapshot_js_1 = require("../../utils/hooks/hooksConfigSnapshot.js");
var lazySchema_js_1 = require("../../utils/lazySchema.js");
var plans_js_1 = require("../../utils/plans.js");
var Shell_js_1 = require("../../utils/Shell.js");
var sessionStorage_js_1 = require("../../utils/sessionStorage.js");
var worktree_js_1 = require("../../utils/worktree.js");
var constants_js_1 = require("./constants.js");
var prompt_js_1 = require("./prompt.js");
var UI_js_1 = require("./UI.js");
var inputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.strictObject({
        action: v4_1.z
            .enum(['keep', 'remove'])
            .describe('"keep" leaves the worktree and branch on disk; "remove" deletes both.'),
        discard_changes: v4_1.z
            .boolean()
            .optional()
            .describe('Required true when action is "remove" and the worktree has uncommitted files or unmerged commits. The tool will refuse and list them otherwise.'),
    });
});
var outputSchema = (0, lazySchema_js_1.lazySchema)(function () {
    return v4_1.z.object({
        action: v4_1.z.enum(['keep', 'remove']),
        originalCwd: v4_1.z.string(),
        worktreePath: v4_1.z.string(),
        worktreeBranch: v4_1.z.string().optional(),
        tmuxSessionName: v4_1.z.string().optional(),
        discardedFiles: v4_1.z.number().optional(),
        discardedCommits: v4_1.z.number().optional(),
        message: v4_1.z.string(),
    });
});
/**
 * Returns null when state cannot be reliably determined — callers that use
 * this as a safety gate must treat null as "unknown, assume unsafe"
 * (fail-closed). A silent 0/0 would let cleanupWorktree destroy real work.
 *
 * Null is returned when:
 * - git status or rev-list exit non-zero (lock file, corrupt index, bad ref)
 * - originalHeadCommit is undefined but git status succeeded — this is the
 *   hook-based-worktree-wrapping-git case (worktree.ts:525-532 doesn't set
 *   originalHeadCommit). We can see the working tree is git, but cannot count
 *   commits without a baseline, so we cannot prove the branch is clean.
 */
function countWorktreeChanges(worktreePath, originalHeadCommit) {
    return __awaiter(this, void 0, void 0, function () {
        var status, changedFiles, revList, commits;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('git', [
                        '-C',
                        worktreePath,
                        'status',
                        '--porcelain',
                    ])];
                case 1:
                    status = _a.sent();
                    if (status.code !== 0) {
                        return [2 /*return*/, null];
                    }
                    changedFiles = (0, array_js_1.count)(status.stdout.split('\n'), function (l) { return l.trim() !== ''; });
                    if (!originalHeadCommit) {
                        // git status succeeded → this is a git repo, but without a baseline
                        // commit we cannot count commits. Fail-closed rather than claim 0.
                        return [2 /*return*/, null];
                    }
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrow)('git', [
                            '-C',
                            worktreePath,
                            'rev-list',
                            '--count',
                            "".concat(originalHeadCommit, "..HEAD"),
                        ])];
                case 2:
                    revList = _a.sent();
                    if (revList.code !== 0) {
                        return [2 /*return*/, null];
                    }
                    commits = parseInt(revList.stdout.trim(), 10) || 0;
                    return [2 /*return*/, { changedFiles: changedFiles, commits: commits }];
            }
        });
    });
}
/**
 * Restore session state to reflect the original directory.
 * This is the inverse of the session-level mutations in EnterWorktreeTool.call().
 *
 * keepWorktree()/cleanupWorktree() handle process.chdir and currentWorktreeSession;
 * this handles everything above the worktree utility layer.
 */
function restoreSessionToOriginalCwd(originalCwd, projectRootIsWorktree) {
    var _a, _b;
    (0, Shell_js_1.setCwd)(originalCwd);
    // EnterWorktree sets originalCwd to the *worktree* path (intentional — see
    // state.ts getProjectRoot comment). Reset to the real original.
    (0, state_js_1.setOriginalCwd)(originalCwd);
    // --worktree startup sets projectRoot to the worktree; mid-session
    // EnterWorktreeTool does not. Only restore when it was actually changed —
    // otherwise we'd move projectRoot to wherever the user had cd'd before
    // entering the worktree (session.originalCwd), breaking the "stable project
    // identity" contract.
    if (projectRootIsWorktree) {
        (0, state_js_1.setProjectRoot)(originalCwd);
        // setup.ts's --worktree block called updateHooksConfigSnapshot() to re-read
        // hooks from the worktree. Restore symmetrically. (Mid-session
        // EnterWorktreeTool never touched the snapshot, so no-op there.)
        (0, hooksConfigSnapshot_js_1.updateHooksConfigSnapshot)();
    }
    (0, sessionStorage_js_1.saveWorktreeState)(null);
    (0, systemPromptSections_js_1.clearSystemPromptSections)();
    (0, claudemd_js_1.clearMemoryFileCaches)();
    (_b = (_a = plans_js_1.getPlansDirectory.cache).clear) === null || _b === void 0 ? void 0 : _b.call(_a);
}
exports.ExitWorktreeTool = (0, Tool_js_1.buildTool)({
    name: constants_js_1.EXIT_WORKTREE_TOOL_NAME,
    searchHint: 'exit a worktree session and return to the original directory',
    maxResultSizeChars: 100000,
    description: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, 'Exits a worktree session created by EnterWorktree and restores the original working directory'];
            });
        });
    },
    prompt: function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, (0, prompt_js_1.getExitWorktreeToolPrompt)()];
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
        return 'Exiting worktree';
    },
    shouldDefer: true,
    isDestructive: function (input) {
        return input.action === 'remove';
    },
    toAutoClassifierInput: function (input) {
        return input.action;
    },
    validateInput: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var session, summary, changedFiles, commits, parts;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        session = (0, worktree_js_1.getCurrentWorktreeSession)();
                        if (!session) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: 'No-op: there is no active EnterWorktree session to exit. This tool only operates on worktrees created by EnterWorktree in the current session — it will not touch worktrees created manually or in a previous session. No filesystem changes were made.',
                                    errorCode: 1,
                                }];
                        }
                        if (!(input.action === 'remove' && !input.discard_changes)) return [3 /*break*/, 2];
                        return [4 /*yield*/, countWorktreeChanges(session.worktreePath, session.originalHeadCommit)];
                    case 1:
                        summary = _b.sent();
                        if (summary === null) {
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Could not verify worktree state at ".concat(session.worktreePath, ". Refusing to remove without explicit confirmation. Re-invoke with discard_changes: true to proceed \u2014 or use action: \"keep\" to preserve the worktree."),
                                    errorCode: 3,
                                }];
                        }
                        changedFiles = summary.changedFiles, commits = summary.commits;
                        if (changedFiles > 0 || commits > 0) {
                            parts = [];
                            if (changedFiles > 0) {
                                parts.push("".concat(changedFiles, " uncommitted ").concat(changedFiles === 1 ? 'file' : 'files'));
                            }
                            if (commits > 0) {
                                parts.push("".concat(commits, " ").concat(commits === 1 ? 'commit' : 'commits', " on ").concat((_a = session.worktreeBranch) !== null && _a !== void 0 ? _a : 'the worktree branch'));
                            }
                            return [2 /*return*/, {
                                    result: false,
                                    message: "Worktree has ".concat(parts.join(' and '), ". Removing will discard this work permanently. Confirm with the user, then re-invoke with discard_changes: true \u2014 or use action: \"keep\" to preserve the worktree."),
                                    errorCode: 2,
                                }];
                        }
                        _b.label = 2;
                    case 2: return [2 /*return*/, { result: true }];
                }
            });
        });
    },
    renderToolUseMessage: UI_js_1.renderToolUseMessage,
    renderToolResultMessage: UI_js_1.renderToolResultMessage,
    call: function (input) {
        return __awaiter(this, void 0, void 0, function () {
            var session, originalCwd, worktreePath, worktreeBranch, tmuxSessionName, originalHeadCommit, projectRootIsWorktree, _a, changedFiles, commits, tmuxNote, discardParts, discardNote;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        session = (0, worktree_js_1.getCurrentWorktreeSession)();
                        if (!session) {
                            // validateInput guards this, but the session is module-level mutable
                            // state — defend against a race between validation and execution.
                            throw new Error('Not in a worktree session');
                        }
                        originalCwd = session.originalCwd, worktreePath = session.worktreePath, worktreeBranch = session.worktreeBranch, tmuxSessionName = session.tmuxSessionName, originalHeadCommit = session.originalHeadCommit;
                        projectRootIsWorktree = (0, state_js_1.getProjectRoot)() === (0, state_js_1.getOriginalCwd)();
                        return [4 /*yield*/, countWorktreeChanges(worktreePath, originalHeadCommit)];
                    case 1:
                        _a = (_b = (_c.sent())) !== null && _b !== void 0 ? _b : { changedFiles: 0, commits: 0 }, changedFiles = _a.changedFiles, commits = _a.commits;
                        if (!(input.action === 'keep')) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, worktree_js_1.keepWorktree)()];
                    case 2:
                        _c.sent();
                        restoreSessionToOriginalCwd(originalCwd, projectRootIsWorktree);
                        (0, index_js_1.logEvent)('tengu_worktree_kept', {
                            mid_session: true,
                            commits: commits,
                            changed_files: changedFiles,
                        });
                        tmuxNote = tmuxSessionName
                            ? " Tmux session ".concat(tmuxSessionName, " is still running; reattach with: tmux attach -t ").concat(tmuxSessionName)
                            : '';
                        return [2 /*return*/, {
                                data: {
                                    action: 'keep',
                                    originalCwd: originalCwd,
                                    worktreePath: worktreePath,
                                    worktreeBranch: worktreeBranch,
                                    tmuxSessionName: tmuxSessionName,
                                    message: "Exited worktree. Your work is preserved at ".concat(worktreePath).concat(worktreeBranch ? " on branch ".concat(worktreeBranch) : '', ". Session is now back in ").concat(originalCwd, ".").concat(tmuxNote),
                                },
                            }];
                    case 3:
                        if (!tmuxSessionName) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, worktree_js_1.killTmuxSession)(tmuxSessionName)];
                    case 4:
                        _c.sent();
                        _c.label = 5;
                    case 5: return [4 /*yield*/, (0, worktree_js_1.cleanupWorktree)()];
                    case 6:
                        _c.sent();
                        restoreSessionToOriginalCwd(originalCwd, projectRootIsWorktree);
                        (0, index_js_1.logEvent)('tengu_worktree_removed', {
                            mid_session: true,
                            commits: commits,
                            changed_files: changedFiles,
                        });
                        discardParts = [];
                        if (commits > 0) {
                            discardParts.push("".concat(commits, " ").concat(commits === 1 ? 'commit' : 'commits'));
                        }
                        if (changedFiles > 0) {
                            discardParts.push("".concat(changedFiles, " uncommitted ").concat(changedFiles === 1 ? 'file' : 'files'));
                        }
                        discardNote = discardParts.length > 0 ? " Discarded ".concat(discardParts.join(' and '), ".") : '';
                        return [2 /*return*/, {
                                data: {
                                    action: 'remove',
                                    originalCwd: originalCwd,
                                    worktreePath: worktreePath,
                                    worktreeBranch: worktreeBranch,
                                    discardedFiles: changedFiles,
                                    discardedCommits: commits,
                                    message: "Exited and removed worktree at ".concat(worktreePath, ".").concat(discardNote, " Session is now back in ").concat(originalCwd, "."),
                                },
                            }];
                }
            });
        });
    },
    mapToolResultToToolResultBlockParam: function (_a, toolUseID) {
        var message = _a.message;
        return {
            type: 'tool_result',
            content: message,
            tool_use_id: toolUseID,
        };
    },
});
