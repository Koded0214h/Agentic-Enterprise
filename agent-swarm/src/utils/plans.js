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
exports.getPlansDirectory = void 0;
exports.getPlanSlug = getPlanSlug;
exports.setPlanSlug = setPlanSlug;
exports.clearPlanSlug = clearPlanSlug;
exports.clearAllPlanSlugs = clearAllPlanSlugs;
exports.getPlanFilePath = getPlanFilePath;
exports.getPlan = getPlan;
exports.copyPlanForResume = copyPlanForResume;
exports.copyPlanForFork = copyPlanForFork;
exports.persistFileSnapshotIfRemote = persistFileSnapshotIfRemote;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var memoize_js_1 = require("lodash-es/memoize.js");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var constants_js_1 = require("../tools/ExitPlanModeTool/constants.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var envUtils_js_1 = require("./envUtils.js");
var errors_js_1 = require("./errors.js");
var outputsScanner_js_1 = require("./filePersistence/outputsScanner.js");
var fsOperations_js_1 = require("./fsOperations.js");
var log_js_1 = require("./log.js");
var settings_js_1 = require("./settings/settings.js");
var words_js_1 = require("./words.js");
var MAX_SLUG_RETRIES = 10;
/**
 * Get or generate a word slug for the current session's plan.
 * The slug is generated lazily on first access and cached for the session.
 * If a plan file with the generated slug already exists, retries up to 10 times.
 */
function getPlanSlug(sessionId) {
    var id = sessionId !== null && sessionId !== void 0 ? sessionId : (0, state_js_1.getSessionId)();
    var cache = (0, state_js_1.getPlanSlugCache)();
    var slug = cache.get(id);
    if (!slug) {
        var plansDir = (0, exports.getPlansDirectory)();
        // Try to find a unique slug that doesn't conflict with existing files
        for (var i = 0; i < MAX_SLUG_RETRIES; i++) {
            slug = (0, words_js_1.generateWordSlug)();
            var filePath = (0, path_1.join)(plansDir, "".concat(slug, ".md"));
            if (!(0, fsOperations_js_1.getFsImplementation)().existsSync(filePath)) {
                break;
            }
        }
        cache.set(id, slug);
    }
    return slug;
}
/**
 * Set a specific plan slug for a session (used when resuming a session)
 */
function setPlanSlug(sessionId, slug) {
    (0, state_js_1.getPlanSlugCache)().set(sessionId, slug);
}
/**
 * Clear the plan slug for the current session.
 * This should be called on /clear to ensure a fresh plan file is used.
 */
function clearPlanSlug(sessionId) {
    var id = sessionId !== null && sessionId !== void 0 ? sessionId : (0, state_js_1.getSessionId)();
    (0, state_js_1.getPlanSlugCache)().delete(id);
}
/**
 * Clear ALL plan slug entries (all sessions).
 * Use this on /clear to free sub-session slug entries.
 */
function clearAllPlanSlugs() {
    (0, state_js_1.getPlanSlugCache)().clear();
}
// Memoized: called from render bodies (FileReadTool/FileEditTool/FileWriteTool UI.tsx)
// and permission checks. Inputs (initial settings + cwd) are fixed at startup, so the
// mkdirSync result is stable for the session. Without memoization, each rendered tool
// message triggers a mkdirSync syscall (regressed in #20005).
exports.getPlansDirectory = (0, memoize_js_1.default)(function getPlansDirectory() {
    var settings = (0, settings_js_1.getInitialSettings)();
    var settingsDir = settings.plansDirectory;
    var plansPath;
    if (settingsDir) {
        // Settings.json (relative to project root)
        var cwd = (0, cwd_js_1.getCwd)();
        var resolved = (0, path_1.resolve)(cwd, settingsDir);
        // Validate path stays within project root to prevent path traversal
        if (!resolved.startsWith(cwd + path_1.sep) && resolved !== cwd) {
            (0, log_js_1.logError)(new Error("plansDirectory must be within project root: ".concat(settingsDir)));
            plansPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'plans');
        }
        else {
            plansPath = resolved;
        }
    }
    else {
        // Default
        plansPath = (0, path_1.join)((0, envUtils_js_1.getClaudeConfigHomeDir)(), 'plans');
    }
    // Ensure directory exists (mkdirSync with recursive: true is a no-op if it exists)
    try {
        (0, fsOperations_js_1.getFsImplementation)().mkdirSync(plansPath);
    }
    catch (error) {
        (0, log_js_1.logError)(error);
    }
    return plansPath;
});
/**
 * Get the file path for a session's plan
 * @param agentId Optional agent ID for subagents. If not provided, returns main session plan.
 * For main conversation (no agentId), returns {planSlug}.md
 * For subagents (agentId provided), returns {planSlug}-agent-{agentId}.md
 */
function getPlanFilePath(agentId) {
    var planSlug = getPlanSlug((0, state_js_1.getSessionId)());
    // Main conversation: simple filename with word slug
    if (!agentId) {
        return (0, path_1.join)((0, exports.getPlansDirectory)(), "".concat(planSlug, ".md"));
    }
    // Subagents: include agent ID
    return (0, path_1.join)((0, exports.getPlansDirectory)(), "".concat(planSlug, "-agent-").concat(agentId, ".md"));
}
/**
 * Get the plan content for a session
 * @param agentId Optional agent ID for subagents. If not provided, returns main session plan.
 */
function getPlan(agentId) {
    var filePath = getPlanFilePath(agentId);
    try {
        return (0, fsOperations_js_1.getFsImplementation)().readFileSync(filePath, { encoding: 'utf-8' });
    }
    catch (error) {
        if ((0, errors_js_1.isENOENT)(error))
            return null;
        (0, log_js_1.logError)(error);
        return null;
    }
}
/**
 * Extract the plan slug from a log's message history.
 */
function getSlugFromLog(log) {
    var _a;
    return (_a = log.messages.find(function (m) { return m.slug; })) === null || _a === void 0 ? void 0 : _a.slug;
}
/**
 * Restore plan slug from a resumed session.
 * Sets the slug in the session cache so getPlanSlug returns it.
 * If the plan file is missing, attempts to recover it from a file snapshot
 * (written incrementally during the session) or from message history.
 * Returns true if a plan file exists (or was recovered) for the slug.
 * @param log The log to restore from
 * @param targetSessionId The session ID to associate the plan slug with.
 *                        This should be the ORIGINAL session ID being resumed,
 *                        not the temporary session ID from before resume.
 */
function copyPlanForResume(log, targetSessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var slug, sessionId, planPath, e_1, snapshotPlan, recovered, writeError_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    slug = getSlugFromLog(log);
                    if (!slug) {
                        return [2 /*return*/, false];
                    }
                    sessionId = targetSessionId !== null && targetSessionId !== void 0 ? targetSessionId : (0, state_js_1.getSessionId)();
                    setPlanSlug(sessionId, slug);
                    planPath = (0, path_1.join)((0, exports.getPlansDirectory)(), "".concat(slug, ".md"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 8]);
                    return [4 /*yield*/, (0, fsOperations_js_1.getFsImplementation)().readFile(planPath, { encoding: 'utf-8' })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    e_1 = _a.sent();
                    if (!(0, errors_js_1.isENOENT)(e_1)) {
                        // Don't throw — called fire-and-forget (void copyPlanForResume(...)) with no .catch()
                        (0, log_js_1.logError)(e_1);
                        return [2 /*return*/, false];
                    }
                    // Only attempt recovery in remote sessions (CCR) where files don't persist
                    if ((0, outputsScanner_js_1.getEnvironmentKind)() === null) {
                        return [2 /*return*/, false];
                    }
                    (0, debug_js_1.logForDebugging)("Plan file missing during resume: ".concat(planPath, ". Attempting recovery."));
                    snapshotPlan = findFileSnapshotEntry(log.messages, 'plan');
                    recovered = null;
                    if (snapshotPlan && snapshotPlan.content.length > 0) {
                        recovered = snapshotPlan.content;
                        (0, debug_js_1.logForDebugging)("Plan recovered from file snapshot, ".concat(recovered.length, " chars"), { level: 'info' });
                    }
                    else {
                        // Fall back to searching message history
                        recovered = recoverPlanFromMessages(log);
                        if (recovered) {
                            (0, debug_js_1.logForDebugging)("Plan recovered from message history, ".concat(recovered.length, " chars"), { level: 'info' });
                        }
                    }
                    if (!recovered) return [3 /*break*/, 7];
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, (0, promises_1.writeFile)(planPath, recovered, { encoding: 'utf-8' })];
                case 5:
                    _a.sent();
                    return [2 /*return*/, true];
                case 6:
                    writeError_1 = _a.sent();
                    (0, log_js_1.logError)(writeError_1);
                    return [2 /*return*/, false];
                case 7:
                    (0, debug_js_1.logForDebugging)('Plan file recovery failed: no file snapshot or plan content found in message history');
                    return [2 /*return*/, false];
                case 8: return [2 /*return*/];
            }
        });
    });
}
/**
 * Copy a plan file for a forked session. Unlike copyPlanForResume (which reuses
 * the original slug), this generates a NEW slug for the forked session and
 * writes the original plan content to the new file. This prevents the original
 * and forked sessions from clobbering each other's plan files.
 */
function copyPlanForFork(log, targetSessionId) {
    return __awaiter(this, void 0, void 0, function () {
        var originalSlug, plansDir, originalPlanPath, newSlug, newPlanPath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    originalSlug = getSlugFromLog(log);
                    if (!originalSlug) {
                        return [2 /*return*/, false];
                    }
                    plansDir = (0, exports.getPlansDirectory)();
                    originalPlanPath = (0, path_1.join)(plansDir, "".concat(originalSlug, ".md"));
                    newSlug = getPlanSlug(targetSessionId);
                    newPlanPath = (0, path_1.join)(plansDir, "".concat(newSlug, ".md"));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.copyFile)(originalPlanPath, newPlanPath)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, true];
                case 3:
                    error_1 = _a.sent();
                    if ((0, errors_js_1.isENOENT)(error_1)) {
                        return [2 /*return*/, false];
                    }
                    (0, log_js_1.logError)(error_1);
                    return [2 /*return*/, false];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Recover plan content from the message history. Plan content can appear in
 * three forms depending on what happened during the session:
 *
 * 1. ExitPlanMode tool_use input — normalizeToolInput injects the plan content
 *    into the tool_use input, which persists in the transcript.
 *
 * 2. planContent field on user messages — set during the "clear context and
 *    implement" flow when ExitPlanMode is approved.
 *
 * 3. plan_file_reference attachment — created by auto-compact to preserve the
 *    plan across compaction boundaries.
 */
function recoverPlanFromMessages(log) {
    var _a;
    for (var i = log.messages.length - 1; i >= 0; i--) {
        var msg = log.messages[i];
        if (!msg) {
            continue;
        }
        if (msg.type === 'assistant') {
            var content = msg.message.content;
            if (Array.isArray(content)) {
                for (var _i = 0, content_1 = content; _i < content_1.length; _i++) {
                    var block = content_1[_i];
                    if (block.type === 'tool_use' &&
                        block.name === constants_js_1.EXIT_PLAN_MODE_V2_TOOL_NAME) {
                        var input = block.input;
                        var plan = input === null || input === void 0 ? void 0 : input.plan;
                        if (typeof plan === 'string' && plan.length > 0) {
                            return plan;
                        }
                    }
                }
            }
        }
        if (msg.type === 'user') {
            var userMsg = msg;
            if (typeof userMsg.planContent === 'string' &&
                userMsg.planContent.length > 0) {
                return userMsg.planContent;
            }
        }
        if (msg.type === 'attachment') {
            var attachmentMsg = msg;
            if (((_a = attachmentMsg.attachment) === null || _a === void 0 ? void 0 : _a.type) === 'plan_file_reference') {
                var plan = attachmentMsg.attachment
                    .planContent;
                if (typeof plan === 'string' && plan.length > 0) {
                    return plan;
                }
            }
        }
    }
    return null;
}
/**
 * Find a file entry in the most recent file-snapshot system message in the transcript.
 * Scans backwards to find the latest snapshot.
 */
function findFileSnapshotEntry(messages, key) {
    for (var i = messages.length - 1; i >= 0; i--) {
        var msg = messages[i];
        if ((msg === null || msg === void 0 ? void 0 : msg.type) === 'system' &&
            'subtype' in msg &&
            msg.subtype === 'file_snapshot' &&
            'snapshotFiles' in msg) {
            var files = msg.snapshotFiles;
            return files.find(function (f) { return f.key === key; });
        }
    }
    return undefined;
}
/**
 * Persist a snapshot of session files (plan, todos) to the transcript.
 * Called incrementally whenever these files change. Only active in remote
 * sessions (CCR) where local files don't persist between sessions.
 */
function persistFileSnapshotIfRemote() {
    return __awaiter(this, void 0, void 0, function () {
        var snapshotFiles, plan, message, recordTranscript, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if ((0, outputsScanner_js_1.getEnvironmentKind)() === null) {
                        return [2 /*return*/];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    snapshotFiles = [];
                    plan = getPlan();
                    if (plan) {
                        snapshotFiles.push({
                            key: 'plan',
                            path: getPlanFilePath(),
                            content: plan,
                        });
                    }
                    if (snapshotFiles.length === 0) {
                        return [2 /*return*/];
                    }
                    message = {
                        type: 'system',
                        subtype: 'file_snapshot',
                        content: 'File snapshot',
                        level: 'info',
                        isMeta: true,
                        timestamp: new Date().toISOString(),
                        uuid: (0, crypto_1.randomUUID)(),
                        snapshotFiles: snapshotFiles,
                    };
                    return [4 /*yield*/, Promise.resolve().then(function () { return require('./sessionStorage.js'); })];
                case 2:
                    recordTranscript = (_a.sent()).recordTranscript;
                    return [4 /*yield*/, recordTranscript([message])];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    (0, log_js_1.logError)(error_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
