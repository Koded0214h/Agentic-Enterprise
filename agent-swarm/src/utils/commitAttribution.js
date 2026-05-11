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
exports.isInternalModelRepo = void 0;
exports.getAttributionRepoRoot = getAttributionRepoRoot;
exports.getRepoClassCached = getRepoClassCached;
exports.isInternalModelRepoCached = isInternalModelRepoCached;
exports.sanitizeSurfaceKey = sanitizeSurfaceKey;
exports.sanitizeModelName = sanitizeModelName;
exports.getClientSurface = getClientSurface;
exports.buildSurfaceKey = buildSurfaceKey;
exports.computeContentHash = computeContentHash;
exports.normalizeFilePath = normalizeFilePath;
exports.expandFilePath = expandFilePath;
exports.createEmptyAttributionState = createEmptyAttributionState;
exports.getFileMtime = getFileMtime;
exports.trackFileModification = trackFileModification;
exports.trackFileCreation = trackFileCreation;
exports.trackFileDeletion = trackFileDeletion;
exports.trackBulkFileChanges = trackBulkFileChanges;
exports.calculateCommitAttribution = calculateCommitAttribution;
exports.getGitDiffSize = getGitDiffSize;
exports.isFileDeleted = isFileDeleted;
exports.getStagedFiles = getStagedFiles;
exports.isGitTransientState = isGitTransientState;
exports.stateToSnapshotMessage = stateToSnapshotMessage;
exports.restoreAttributionStateFromSnapshots = restoreAttributionStateFromSnapshots;
exports.attributionRestoreStateFromLog = attributionRestoreStateFromLog;
exports.incrementPromptCount = incrementPromptCount;
var crypto_1 = require("crypto");
var promises_1 = require("fs/promises");
var path_1 = require("path");
var state_js_1 = require("../bootstrap/state.js");
var cwd_js_1 = require("./cwd.js");
var debug_js_1 = require("./debug.js");
var execFileNoThrow_js_1 = require("./execFileNoThrow.js");
var fsOperations_js_1 = require("./fsOperations.js");
var generatedFiles_js_1 = require("./generatedFiles.js");
var gitFilesystem_js_1 = require("./git/gitFilesystem.js");
var git_js_1 = require("./git.js");
var log_js_1 = require("./log.js");
var model_js_1 = require("./model/model.js");
var sequential_js_1 = require("./sequential.js");
/**
 * List of repos where internal model names are allowed in trailers.
 * Includes both SSH and HTTPS URL formats.
 *
 * NOTE: This is intentionally a repo allowlist, not an org-wide check.
 * The anthropics and anthropic-experimental orgs contain PUBLIC repos
 * (e.g. anthropics/claude-code, anthropic-experimental/sandbox-runtime).
 * Undercover mode must stay ON in those to prevent codename leaks.
 * Only add repos here that are confirmed PRIVATE.
 */
var INTERNAL_MODEL_REPOS = [
    'github.com:anthropics/claude-cli-internal',
    'github.com/anthropics/claude-cli-internal',
    'github.com:anthropics/anthropic',
    'github.com/anthropics/anthropic',
    'github.com:anthropics/apps',
    'github.com/anthropics/apps',
    'github.com:anthropics/casino',
    'github.com/anthropics/casino',
    'github.com:anthropics/dbt',
    'github.com/anthropics/dbt',
    'github.com:anthropics/dotfiles',
    'github.com/anthropics/dotfiles',
    'github.com:anthropics/terraform-config',
    'github.com/anthropics/terraform-config',
    'github.com:anthropics/hex-export',
    'github.com/anthropics/hex-export',
    'github.com:anthropics/feedback-v2',
    'github.com/anthropics/feedback-v2',
    'github.com:anthropics/labs',
    'github.com/anthropics/labs',
    'github.com:anthropics/argo-rollouts',
    'github.com/anthropics/argo-rollouts',
    'github.com:anthropics/starling-configs',
    'github.com/anthropics/starling-configs',
    'github.com:anthropics/ts-tools',
    'github.com/anthropics/ts-tools',
    'github.com:anthropics/ts-capsules',
    'github.com/anthropics/ts-capsules',
    'github.com:anthropics/feldspar-testing',
    'github.com/anthropics/feldspar-testing',
    'github.com:anthropics/trellis',
    'github.com/anthropics/trellis',
    'github.com:anthropics/claude-for-hiring',
    'github.com/anthropics/claude-for-hiring',
    'github.com:anthropics/forge-web',
    'github.com/anthropics/forge-web',
    'github.com:anthropics/infra-manifests',
    'github.com/anthropics/infra-manifests',
    'github.com:anthropics/mycro_manifests',
    'github.com/anthropics/mycro_manifests',
    'github.com:anthropics/mycro_configs',
    'github.com/anthropics/mycro_configs',
    'github.com:anthropics/mobile-apps',
    'github.com/anthropics/mobile-apps',
];
/**
 * Get the repo root for attribution operations.
 * Uses getCwd() which respects agent worktree overrides (AsyncLocalStorage),
 * then resolves to git root to handle `cd subdir` case.
 * Falls back to getOriginalCwd() if git root can't be determined.
 */
function getAttributionRepoRoot() {
    var _a;
    var cwd = (0, cwd_js_1.getCwd)();
    return (_a = (0, git_js_1.findGitRoot)(cwd)) !== null && _a !== void 0 ? _a : (0, state_js_1.getOriginalCwd)();
}
// Cache for repo classification result. Primed once per process.
// 'internal' = remote matches INTERNAL_MODEL_REPOS allowlist
// 'external' = has a remote, not on allowlist (public/open-source repo)
// 'none'     = no remote URL (not a git repo, or no remote configured)
var repoClassCache = null;
/**
 * Synchronously return the cached repo classification.
 * Returns null if the async check hasn't run yet.
 */
function getRepoClassCached() {
    return repoClassCache;
}
/**
 * Synchronously return the cached result of isInternalModelRepo().
 * Returns false if the check hasn't run yet (safe default: don't leak).
 */
function isInternalModelRepoCached() {
    return repoClassCache === 'internal';
}
/**
 * Check if the current repo is in the allowlist for internal model names.
 * Memoized - only checks once per process.
 */
exports.isInternalModelRepo = (0, sequential_js_1.sequential)(function () { return __awaiter(void 0, void 0, void 0, function () {
    var cwd, remoteUrl, isInternal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (repoClassCache !== null) {
                    return [2 /*return*/, repoClassCache === 'internal'];
                }
                cwd = getAttributionRepoRoot();
                return [4 /*yield*/, (0, gitFilesystem_js_1.getRemoteUrlForDir)(cwd)];
            case 1:
                remoteUrl = _a.sent();
                if (!remoteUrl) {
                    repoClassCache = 'none';
                    return [2 /*return*/, false];
                }
                isInternal = INTERNAL_MODEL_REPOS.some(function (repo) { return remoteUrl.includes(repo); });
                repoClassCache = isInternal ? 'internal' : 'external';
                return [2 /*return*/, isInternal];
        }
    });
}); });
/**
 * Sanitize a surface key to use public model names.
 * Converts internal model variants to their public equivalents.
 */
function sanitizeSurfaceKey(surfaceKey) {
    // Split surface key into surface and model parts (e.g., "cli/opus-4-5-fast" -> ["cli", "opus-4-5-fast"])
    var slashIndex = surfaceKey.lastIndexOf('/');
    if (slashIndex === -1) {
        return surfaceKey;
    }
    var surface = surfaceKey.slice(0, slashIndex);
    var model = surfaceKey.slice(slashIndex + 1);
    var sanitizedModel = sanitizeModelName(model);
    return "".concat(surface, "/").concat(sanitizedModel);
}
// @[MODEL LAUNCH]: Add a mapping for the new model ID so git commit trailers show the public name.
/**
 * Sanitize a model name to its public equivalent.
 * Maps internal variants to their public names based on model family.
 */
function sanitizeModelName(shortName) {
    // Map internal variants to public equivalents based on model family
    if (shortName.includes('opus-4-6'))
        return 'claude-opus-4-6';
    if (shortName.includes('opus-4-5'))
        return 'claude-opus-4-5';
    if (shortName.includes('opus-4-1'))
        return 'claude-opus-4-1';
    if (shortName.includes('opus-4'))
        return 'claude-opus-4';
    if (shortName.includes('sonnet-4-6'))
        return 'claude-sonnet-4-6';
    if (shortName.includes('sonnet-4-5'))
        return 'claude-sonnet-4-5';
    if (shortName.includes('sonnet-4'))
        return 'claude-sonnet-4';
    if (shortName.includes('sonnet-3-7'))
        return 'claude-sonnet-3-7';
    if (shortName.includes('haiku-4-5'))
        return 'claude-haiku-4-5';
    if (shortName.includes('haiku-3-5'))
        return 'claude-haiku-3-5';
    // Unknown models get a generic name
    return 'claude';
}
/**
 * Get the current client surface from environment.
 */
function getClientSurface() {
    var _a;
    return (_a = process.env.CLAUDE_CODE_ENTRYPOINT) !== null && _a !== void 0 ? _a : 'cli';
}
/**
 * Build a surface key that includes the model name.
 * Format: "surface/model" (e.g., "cli/claude-sonnet")
 */
function buildSurfaceKey(surface, model) {
    return "".concat(surface, "/").concat((0, model_js_1.getCanonicalName)(model));
}
/**
 * Compute SHA-256 hash of content.
 */
function computeContentHash(content) {
    return (0, crypto_1.createHash)('sha256').update(content).digest('hex');
}
/**
 * Normalize file path to relative path from cwd for consistent tracking.
 * Resolves symlinks to handle /tmp vs /private/tmp on macOS.
 */
function normalizeFilePath(filePath) {
    var fs = (0, fsOperations_js_1.getFsImplementation)();
    var cwd = getAttributionRepoRoot();
    if (!(0, path_1.isAbsolute)(filePath)) {
        return filePath;
    }
    // Resolve symlinks in both paths for consistent comparison
    // (e.g., /tmp -> /private/tmp on macOS)
    var resolvedPath = filePath;
    var resolvedCwd = cwd;
    try {
        resolvedPath = fs.realpathSync(filePath);
    }
    catch (_a) {
        // File may not exist yet, use original path
    }
    try {
        resolvedCwd = fs.realpathSync(cwd);
    }
    catch (_b) {
        // Keep original cwd
    }
    if (resolvedPath.startsWith(resolvedCwd + path_1.sep) ||
        resolvedPath === resolvedCwd) {
        // Normalize to forward slashes so keys match git diff output on Windows
        return (0, path_1.relative)(resolvedCwd, resolvedPath).replaceAll(path_1.sep, '/');
    }
    // Fallback: try original comparison
    if (filePath.startsWith(cwd + path_1.sep) || filePath === cwd) {
        return (0, path_1.relative)(cwd, filePath).replaceAll(path_1.sep, '/');
    }
    return filePath;
}
/**
 * Expand a relative path to absolute path.
 */
function expandFilePath(filePath) {
    if ((0, path_1.isAbsolute)(filePath)) {
        return filePath;
    }
    return (0, path_1.join)(getAttributionRepoRoot(), filePath);
}
/**
 * Create an empty attribution state for a new session.
 */
function createEmptyAttributionState() {
    return {
        fileStates: new Map(),
        sessionBaselines: new Map(),
        surface: getClientSurface(),
        startingHeadSha: null,
        promptCount: 0,
        promptCountAtLastCommit: 0,
        permissionPromptCount: 0,
        permissionPromptCountAtLastCommit: 0,
        escapeCount: 0,
        escapeCountAtLastCommit: 0,
    };
}
/**
 * Compute the character contribution for a file modification.
 * Returns the FileAttributionState to store, or null if tracking failed.
 */
function computeFileModificationState(existingFileStates, filePath, oldContent, newContent, mtime) {
    var _a;
    var normalizedPath = normalizeFilePath(filePath);
    try {
        // Calculate Claude's character contribution
        var claudeContribution = void 0;
        if (oldContent === '' || newContent === '') {
            // New file or full deletion - contribution is the content length
            claudeContribution =
                oldContent === '' ? newContent.length : oldContent.length;
        }
        else {
            // Find actual changed region via common prefix/suffix matching.
            // This correctly handles same-length replacements (e.g., "Esc" → "esc")
            // where Math.abs(newLen - oldLen) would be 0.
            var minLen = Math.min(oldContent.length, newContent.length);
            var prefixEnd = 0;
            while (prefixEnd < minLen &&
                oldContent[prefixEnd] === newContent[prefixEnd]) {
                prefixEnd++;
            }
            var suffixLen = 0;
            while (suffixLen < minLen - prefixEnd &&
                oldContent[oldContent.length - 1 - suffixLen] ===
                    newContent[newContent.length - 1 - suffixLen]) {
                suffixLen++;
            }
            var oldChangedLen = oldContent.length - prefixEnd - suffixLen;
            var newChangedLen = newContent.length - prefixEnd - suffixLen;
            claudeContribution = Math.max(oldChangedLen, newChangedLen);
        }
        // Get current file state if it exists
        var existingState = existingFileStates.get(normalizedPath);
        var existingContribution = (_a = existingState === null || existingState === void 0 ? void 0 : existingState.claudeContribution) !== null && _a !== void 0 ? _a : 0;
        return {
            contentHash: computeContentHash(newContent),
            claudeContribution: existingContribution + claudeContribution,
            mtime: mtime,
        };
    }
    catch (error) {
        (0, log_js_1.logError)(error);
        return null;
    }
}
/**
 * Get a file's modification time (mtimeMs), falling back to Date.now() if
 * the file doesn't exist. This is async so it can be precomputed before
 * entering a sync setAppState callback.
 */
function getFileMtime(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var normalizedPath, absPath, stats, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    normalizedPath = normalizeFilePath(filePath);
                    absPath = expandFilePath(normalizedPath);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, promises_1.stat)(absPath)];
                case 2:
                    stats = _b.sent();
                    return [2 /*return*/, stats.mtimeMs];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, Date.now()];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Track a file modification by Claude.
 * Called after Edit/Write tool completes.
 */
function trackFileModification(state, filePath, oldContent, newContent, _userModified, mtime) {
    if (mtime === void 0) { mtime = Date.now(); }
    var normalizedPath = normalizeFilePath(filePath);
    var newFileState = computeFileModificationState(state.fileStates, filePath, oldContent, newContent, mtime);
    if (!newFileState) {
        return state;
    }
    var newFileStates = new Map(state.fileStates);
    newFileStates.set(normalizedPath, newFileState);
    (0, debug_js_1.logForDebugging)("Attribution: Tracked ".concat(newFileState.claudeContribution, " chars for ").concat(normalizedPath));
    return __assign(__assign({}, state), { fileStates: newFileStates });
}
/**
 * Track a file creation by Claude (e.g., via bash command).
 * Used when Claude creates a new file through a non-tracked mechanism.
 */
function trackFileCreation(state, filePath, content, mtime) {
    if (mtime === void 0) { mtime = Date.now(); }
    // A creation is simply a modification from empty to the new content
    return trackFileModification(state, filePath, '', content, false, mtime);
}
/**
 * Track a file deletion by Claude (e.g., via bash rm command).
 * Used when Claude deletes a file through a non-tracked mechanism.
 */
function trackFileDeletion(state, filePath, oldContent) {
    var _a;
    var normalizedPath = normalizeFilePath(filePath);
    var existingState = state.fileStates.get(normalizedPath);
    var existingContribution = (_a = existingState === null || existingState === void 0 ? void 0 : existingState.claudeContribution) !== null && _a !== void 0 ? _a : 0;
    var deletedChars = oldContent.length;
    var newFileState = {
        contentHash: '', // Empty hash for deleted files
        claudeContribution: existingContribution + deletedChars,
        mtime: Date.now(),
    };
    var newFileStates = new Map(state.fileStates);
    newFileStates.set(normalizedPath, newFileState);
    (0, debug_js_1.logForDebugging)("Attribution: Tracked deletion of ".concat(normalizedPath, " (").concat(deletedChars, " chars removed, total contribution: ").concat(newFileState.claudeContribution, ")"));
    return __assign(__assign({}, state), { fileStates: newFileStates });
}
// --
/**
 * Track multiple file changes in bulk, mutating a single Map copy.
 * This avoids the O(n²) cost of copying the Map per file when processing
 * large git diffs (e.g., jj operations that touch hundreds of thousands of files).
 */
function trackBulkFileChanges(state, changes) {
    var _a, _b;
    // Create ONE copy of the Map, then mutate it for each file
    var newFileStates = new Map(state.fileStates);
    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
        var change = changes_1[_i];
        var mtime = (_a = change.mtime) !== null && _a !== void 0 ? _a : Date.now();
        if (change.type === 'deleted') {
            var normalizedPath = normalizeFilePath(change.path);
            var existingState = newFileStates.get(normalizedPath);
            var existingContribution = (_b = existingState === null || existingState === void 0 ? void 0 : existingState.claudeContribution) !== null && _b !== void 0 ? _b : 0;
            var deletedChars = change.oldContent.length;
            newFileStates.set(normalizedPath, {
                contentHash: '',
                claudeContribution: existingContribution + deletedChars,
                mtime: mtime,
            });
            (0, debug_js_1.logForDebugging)("Attribution: Tracked deletion of ".concat(normalizedPath, " (").concat(deletedChars, " chars removed, total contribution: ").concat(existingContribution + deletedChars, ")"));
        }
        else {
            var newFileState = computeFileModificationState(newFileStates, change.path, change.oldContent, change.newContent, mtime);
            if (newFileState) {
                var normalizedPath = normalizeFilePath(change.path);
                newFileStates.set(normalizedPath, newFileState);
                (0, debug_js_1.logForDebugging)("Attribution: Tracked ".concat(newFileState.claudeContribution, " chars for ").concat(normalizedPath));
            }
        }
    }
    return __assign(__assign({}, state), { fileStates: newFileStates });
}
/**
 * Calculate final attribution for staged files.
 * Compares session baseline to committed state.
 */
function calculateCommitAttribution(states, stagedFiles) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, sessionId, files, excludedGenerated, surfaces, surfaceCounts, totalClaudeChars, totalHumanChars, mergedFileStates, mergedBaselines, _i, states_1, state, baselines, _a, baselines_1, _b, path, baseline, fileStates, _c, fileStates_1, _d, path, fileState, existing, fileResults, _e, fileResults_1, result, totalChars, claudePercent, surfaceBreakdown, _f, _g, _h, surface, chars, percent;
        var _this = this;
        var _j, _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    cwd = getAttributionRepoRoot();
                    sessionId = (0, state_js_1.getSessionId)();
                    files = {};
                    excludedGenerated = [];
                    surfaces = new Set();
                    surfaceCounts = {};
                    totalClaudeChars = 0;
                    totalHumanChars = 0;
                    mergedFileStates = new Map();
                    mergedBaselines = new Map();
                    for (_i = 0, states_1 = states; _i < states_1.length; _i++) {
                        state = states_1[_i];
                        surfaces.add(state.surface);
                        baselines = state.sessionBaselines instanceof Map
                            ? state.sessionBaselines
                            : new Map(Object.entries(((_j = state.sessionBaselines) !== null && _j !== void 0 ? _j : {})));
                        for (_a = 0, baselines_1 = baselines; _a < baselines_1.length; _a++) {
                            _b = baselines_1[_a], path = _b[0], baseline = _b[1];
                            if (!mergedBaselines.has(path)) {
                                mergedBaselines.set(path, baseline);
                            }
                        }
                        fileStates = state.fileStates instanceof Map
                            ? state.fileStates
                            : new Map(Object.entries(((_k = state.fileStates) !== null && _k !== void 0 ? _k : {})));
                        for (_c = 0, fileStates_1 = fileStates; _c < fileStates_1.length; _c++) {
                            _d = fileStates_1[_c], path = _d[0], fileState = _d[1];
                            existing = mergedFileStates.get(path);
                            if (existing) {
                                mergedFileStates.set(path, __assign(__assign({}, fileState), { claudeContribution: existing.claudeContribution + fileState.claudeContribution }));
                            }
                            else {
                                mergedFileStates.set(path, fileState);
                            }
                        }
                    }
                    return [4 /*yield*/, Promise.all(stagedFiles.map(function (file) { return __awaiter(_this, void 0, void 0, function () {
                            var absPath, fileState, baseline, fileSurface, claudeChars, humanChars, deleted, diffSize, stats, diffSize, _a, total, percent;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        // Skip generated files
                                        if ((0, generatedFiles_js_1.isGeneratedFile)(file)) {
                                            return [2 /*return*/, { type: 'generated', file: file }];
                                        }
                                        absPath = (0, path_1.join)(cwd, file);
                                        fileState = mergedFileStates.get(file);
                                        baseline = mergedBaselines.get(file);
                                        fileSurface = states[0].surface;
                                        claudeChars = 0;
                                        humanChars = 0;
                                        return [4 /*yield*/, isFileDeleted(file)];
                                    case 1:
                                        deleted = _b.sent();
                                        if (!deleted) return [3 /*break*/, 5];
                                        if (!fileState) return [3 /*break*/, 2];
                                        // Claude deleted this file (tracked deletion)
                                        claudeChars = fileState.claudeContribution;
                                        humanChars = 0;
                                        return [3 /*break*/, 4];
                                    case 2: return [4 /*yield*/, getGitDiffSize(file)];
                                    case 3:
                                        diffSize = _b.sent();
                                        humanChars = diffSize > 0 ? diffSize : 100; // Minimum attribution for a deletion
                                        _b.label = 4;
                                    case 4: return [3 /*break*/, 12];
                                    case 5:
                                        _b.trys.push([5, 11, , 12]);
                                        return [4 /*yield*/, (0, promises_1.stat)(absPath)];
                                    case 6:
                                        stats = _b.sent();
                                        if (!fileState) return [3 /*break*/, 7];
                                        // We have tracked modifications for this file
                                        claudeChars = fileState.claudeContribution;
                                        humanChars = 0;
                                        return [3 /*break*/, 10];
                                    case 7:
                                        if (!baseline) return [3 /*break*/, 9];
                                        return [4 /*yield*/, getGitDiffSize(file)];
                                    case 8:
                                        diffSize = _b.sent();
                                        humanChars = diffSize > 0 ? diffSize : stats.size;
                                        return [3 /*break*/, 10];
                                    case 9:
                                        // New file not created by Claude
                                        humanChars = stats.size;
                                        _b.label = 10;
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        _a = _b.sent();
                                        // File doesn't exist or stat failed - skip it
                                        return [2 /*return*/, null];
                                    case 12:
                                        // Ensure non-negative values
                                        claudeChars = Math.max(0, claudeChars);
                                        humanChars = Math.max(0, humanChars);
                                        total = claudeChars + humanChars;
                                        percent = total > 0 ? Math.round((claudeChars / total) * 100) : 0;
                                        return [2 /*return*/, {
                                                type: 'file',
                                                file: file,
                                                claudeChars: claudeChars,
                                                humanChars: humanChars,
                                                percent: percent,
                                                surface: fileSurface,
                                            }];
                                }
                            });
                        }); }))
                        // Aggregate results
                    ];
                case 1:
                    fileResults = _m.sent();
                    // Aggregate results
                    for (_e = 0, fileResults_1 = fileResults; _e < fileResults_1.length; _e++) {
                        result = fileResults_1[_e];
                        if (!result)
                            continue;
                        if (result.type === 'generated') {
                            excludedGenerated.push(result.file);
                            continue;
                        }
                        files[result.file] = {
                            claudeChars: result.claudeChars,
                            humanChars: result.humanChars,
                            percent: result.percent,
                            surface: result.surface,
                        };
                        totalClaudeChars += result.claudeChars;
                        totalHumanChars += result.humanChars;
                        surfaceCounts[result.surface] =
                            ((_l = surfaceCounts[result.surface]) !== null && _l !== void 0 ? _l : 0) + result.claudeChars;
                    }
                    totalChars = totalClaudeChars + totalHumanChars;
                    claudePercent = totalChars > 0 ? Math.round((totalClaudeChars / totalChars) * 100) : 0;
                    surfaceBreakdown = {};
                    for (_f = 0, _g = Object.entries(surfaceCounts); _f < _g.length; _f++) {
                        _h = _g[_f], surface = _h[0], chars = _h[1];
                        percent = totalChars > 0 ? Math.round((chars / totalChars) * 100) : 0;
                        surfaceBreakdown[surface] = { claudeChars: chars, percent: percent };
                    }
                    return [2 /*return*/, {
                            version: 1,
                            summary: {
                                claudePercent: claudePercent,
                                claudeChars: totalClaudeChars,
                                humanChars: totalHumanChars,
                                surfaces: Array.from(surfaces),
                            },
                            files: files,
                            surfaceBreakdown: surfaceBreakdown,
                            excludedGenerated: excludedGenerated,
                            sessions: [sessionId],
                        }];
            }
        });
    });
}
/**
 * Get the size of changes for a file from git diff.
 * Returns the number of characters added/removed (absolute difference).
 * For new files, returns the total file size.
 * For deleted files, returns the size of the deleted content.
 */
function getGitDiffSize(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, result, lines, totalChanges, _i, lines_1, line, insertMatch, deleteMatch, insertions, deletions, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cwd = getAttributionRepoRoot();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['diff', '--cached', '--stat', '--', filePath], { cwd: cwd, timeout: 5000 })];
                case 2:
                    result = _b.sent();
                    if (result.code !== 0 || !result.stdout) {
                        return [2 /*return*/, 0];
                    }
                    lines = result.stdout.split('\n').filter(Boolean);
                    totalChanges = 0;
                    for (_i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                        line = lines_1[_i];
                        // Skip the summary line (e.g., "1 file changed, 3 insertions(+), 2 deletions(-)")
                        if (line.includes('file changed') || line.includes('files changed')) {
                            insertMatch = line.match(/(\d+) insertions?/);
                            deleteMatch = line.match(/(\d+) deletions?/);
                            insertions = insertMatch ? parseInt(insertMatch[1], 10) : 0;
                            deletions = deleteMatch ? parseInt(deleteMatch[1], 10) : 0;
                            totalChanges += (insertions + deletions) * 40;
                        }
                    }
                    return [2 /*return*/, totalChanges];
                case 3:
                    _a = _b.sent();
                    return [2 /*return*/, 0];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Check if a file was deleted in the staged changes.
 */
function isFileDeleted(filePath) {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    cwd = getAttributionRepoRoot();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['diff', '--cached', '--name-status', '--', filePath], { cwd: cwd, timeout: 5000 })];
                case 2:
                    result = _b.sent();
                    if (result.code === 0 && result.stdout) {
                        // Format: "D\tfilename" for deleted files
                        return [2 /*return*/, result.stdout.trim().startsWith('D\t')];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    _a = _b.sent();
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Get staged files from git.
 */
function getStagedFiles() {
    return __awaiter(this, void 0, void 0, function () {
        var cwd, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    cwd = getAttributionRepoRoot();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, execFileNoThrow_js_1.execFileNoThrowWithCwd)((0, git_js_1.gitExe)(), ['diff', '--cached', '--name-only'], { cwd: cwd, timeout: 5000 })];
                case 2:
                    result = _a.sent();
                    if (result.code === 0 && result.stdout) {
                        return [2 /*return*/, result.stdout.split('\n').filter(Boolean)];
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    (0, log_js_1.logError)(error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/, []];
            }
        });
    });
}
// formatAttributionTrailer moved to attributionTrailer.ts for tree-shaking
// (contains excluded strings that should not be in external builds)
/**
 * Check if we're in a transient git state (rebase, merge, cherry-pick).
 */
function isGitTransientState() {
    return __awaiter(this, void 0, void 0, function () {
        var gitDir, indicators, results;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, gitFilesystem_js_1.resolveGitDir)(getAttributionRepoRoot())];
                case 1:
                    gitDir = _a.sent();
                    if (!gitDir)
                        return [2 /*return*/, false];
                    indicators = [
                        'rebase-merge',
                        'rebase-apply',
                        'MERGE_HEAD',
                        'CHERRY_PICK_HEAD',
                        'BISECT_LOG',
                    ];
                    return [4 /*yield*/, Promise.all(indicators.map(function (indicator) { return __awaiter(_this, void 0, void 0, function () {
                            var _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, (0, promises_1.stat)((0, path_1.join)(gitDir, indicator))];
                                    case 1:
                                        _b.sent();
                                        return [2 /*return*/, true];
                                    case 2:
                                        _a = _b.sent();
                                        return [2 /*return*/, false];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); }))];
                case 2:
                    results = _a.sent();
                    return [2 /*return*/, results.some(function (exists) { return exists; })];
            }
        });
    });
}
/**
 * Convert attribution state to snapshot message for persistence.
 */
function stateToSnapshotMessage(state, messageId) {
    var fileStates = {};
    for (var _i = 0, _a = state.fileStates; _i < _a.length; _i++) {
        var _b = _a[_i], path = _b[0], fileState = _b[1];
        fileStates[path] = fileState;
    }
    return {
        type: 'attribution-snapshot',
        messageId: messageId,
        surface: state.surface,
        fileStates: fileStates,
        promptCount: state.promptCount,
        promptCountAtLastCommit: state.promptCountAtLastCommit,
        permissionPromptCount: state.permissionPromptCount,
        permissionPromptCountAtLastCommit: state.permissionPromptCountAtLastCommit,
        escapeCount: state.escapeCount,
        escapeCountAtLastCommit: state.escapeCountAtLastCommit,
    };
}
/**
 * Restore attribution state from snapshot messages.
 */
function restoreAttributionStateFromSnapshots(snapshots) {
    var _a, _b, _c, _d, _e, _f;
    var state = createEmptyAttributionState();
    // Snapshots are full-state dumps (see stateToSnapshotMessage), not deltas.
    // The last snapshot has the most recent count for every path — fileStates
    // never shrinks. Iterating and SUMMING counts across snapshots causes
    // quadratic growth on restore (837 snapshots × 280 files → 1.15 quadrillion
    // "chars" tracked for a 5KB file over a 5-day session).
    var lastSnapshot = snapshots[snapshots.length - 1];
    if (!lastSnapshot) {
        return state;
    }
    state.surface = lastSnapshot.surface;
    for (var _i = 0, _g = Object.entries(lastSnapshot.fileStates); _i < _g.length; _i++) {
        var _h = _g[_i], path = _h[0], fileState = _h[1];
        state.fileStates.set(path, fileState);
    }
    // Restore prompt counts from the last snapshot (most recent state)
    state.promptCount = (_a = lastSnapshot.promptCount) !== null && _a !== void 0 ? _a : 0;
    state.promptCountAtLastCommit = (_b = lastSnapshot.promptCountAtLastCommit) !== null && _b !== void 0 ? _b : 0;
    state.permissionPromptCount = (_c = lastSnapshot.permissionPromptCount) !== null && _c !== void 0 ? _c : 0;
    state.permissionPromptCountAtLastCommit =
        (_d = lastSnapshot.permissionPromptCountAtLastCommit) !== null && _d !== void 0 ? _d : 0;
    state.escapeCount = (_e = lastSnapshot.escapeCount) !== null && _e !== void 0 ? _e : 0;
    state.escapeCountAtLastCommit = (_f = lastSnapshot.escapeCountAtLastCommit) !== null && _f !== void 0 ? _f : 0;
    return state;
}
/**
 * Restore attribution state from log snapshots on session resume.
 */
function attributionRestoreStateFromLog(attributionSnapshots, onUpdateState) {
    var state = restoreAttributionStateFromSnapshots(attributionSnapshots);
    onUpdateState(state);
}
/**
 * Increment promptCount and save an attribution snapshot.
 * Used to persist the prompt count across compaction.
 *
 * @param attribution - Current attribution state
 * @param saveSnapshot - Function to save the snapshot (allows async handling by caller)
 * @returns New attribution state with incremented promptCount
 */
function incrementPromptCount(attribution, saveSnapshot) {
    var newAttribution = __assign(__assign({}, attribution), { promptCount: attribution.promptCount + 1 });
    var snapshot = stateToSnapshotMessage(newAttribution, (0, crypto_1.randomUUID)());
    saveSnapshot(snapshot);
    return newAttribution;
}
