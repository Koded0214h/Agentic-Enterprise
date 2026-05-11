"use strict";
/**
 * CLAUDE.md File Utilities
 *
 * Shared utilities for writing folder-level CLAUDE.md files with
 * auto-generated context sections. Preserves user content outside
 * <claude-mem-context> tags.
 */
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
exports.replaceTaggedContent = replaceTaggedContent;
exports.writeClaudeMdToFolder = writeClaudeMdToFolder;
exports.formatTimelineForClaudeMd = formatTimelineForClaudeMd;
exports.updateFolderClaudeMdFiles = updateFolderClaudeMdFiles;
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
var logger_js_1 = require("./logger.js");
var timeline_formatting_js_1 = require("../shared/timeline-formatting.js");
var SettingsDefaultsManager_js_1 = require("../shared/SettingsDefaultsManager.js");
var worker_utils_js_1 = require("../shared/worker-utils.js");
var SETTINGS_PATH = path_1.default.join(os_1.default.homedir(), '.claude-mem', 'settings.json');
/**
 * Check for consecutive duplicate path segments like frontend/frontend/ or src/src/.
 * This catches paths created when cwd already includes the directory name (Issue #814).
 *
 * @param resolvedPath - The resolved absolute path to check
 * @returns true if consecutive duplicate segments are found
 */
function hasConsecutiveDuplicateSegments(resolvedPath) {
    var segments = resolvedPath.split(path_1.default.sep).filter(function (s) { return s && s !== '.' && s !== '..'; });
    for (var i = 1; i < segments.length; i++) {
        if (segments[i] === segments[i - 1])
            return true;
    }
    return false;
}
/**
 * Validate that a file path is safe for CLAUDE.md generation.
 * Rejects tilde paths, URLs, command-like strings, and paths with invalid chars.
 *
 * @param filePath - The file path to validate
 * @param projectRoot - Optional project root for boundary checking
 * @returns true if path is valid for CLAUDE.md processing
 */
function isValidPathForClaudeMd(filePath, projectRoot) {
    // Reject empty or whitespace-only
    if (!filePath || !filePath.trim())
        return false;
    // Reject tilde paths (Node.js doesn't expand ~)
    if (filePath.startsWith('~'))
        return false;
    // Reject URLs
    if (filePath.startsWith('http://') || filePath.startsWith('https://'))
        return false;
    // Reject paths with spaces (likely command text or PR references)
    if (filePath.includes(' '))
        return false;
    // Reject paths with # (GitHub issue/PR references)
    if (filePath.includes('#'))
        return false;
    // If projectRoot provided, ensure path stays within project boundaries
    if (projectRoot) {
        // For relative paths, resolve against projectRoot; for absolute paths, use directly
        var resolved = path_1.default.isAbsolute(filePath) ? filePath : path_1.default.resolve(projectRoot, filePath);
        var normalizedRoot = path_1.default.resolve(projectRoot);
        if (!resolved.startsWith(normalizedRoot + path_1.default.sep) && resolved !== normalizedRoot) {
            return false;
        }
        // Reject paths with consecutive duplicate segments (Issue #814)
        // e.g., frontend/frontend/, backend/backend/, src/src/
        if (hasConsecutiveDuplicateSegments(resolved)) {
            return false;
        }
    }
    return true;
}
/**
 * Replace tagged content in existing file, preserving content outside tags.
 *
 * Handles three cases:
 * 1. No existing content → wraps new content in tags
 * 2. Has existing tags → replaces only tagged section
 * 3. No tags in existing content → appends tagged content at end
 */
function replaceTaggedContent(existingContent, newContent) {
    var startTag = '<claude-mem-context>';
    var endTag = '</claude-mem-context>';
    // If no existing content, wrap new content in tags
    if (!existingContent) {
        return "".concat(startTag, "\n").concat(newContent, "\n").concat(endTag);
    }
    // If existing has tags, replace only tagged section
    var startIdx = existingContent.indexOf(startTag);
    var endIdx = existingContent.indexOf(endTag);
    if (startIdx !== -1 && endIdx !== -1) {
        return existingContent.substring(0, startIdx) +
            "".concat(startTag, "\n").concat(newContent, "\n").concat(endTag) +
            existingContent.substring(endIdx + endTag.length);
    }
    // If no tags exist, append tagged content at end
    return existingContent + "\n\n".concat(startTag, "\n").concat(newContent, "\n").concat(endTag);
}
/**
 * Write CLAUDE.md file to folder with atomic writes.
 * Only writes to existing folders; skips non-existent paths to prevent
 * creating spurious directory structures from malformed paths.
 *
 * @param folderPath - Absolute path to the folder (must already exist)
 * @param newContent - Content to write inside tags
 */
function writeClaudeMdToFolder(folderPath, newContent) {
    var resolvedPath = path_1.default.resolve(folderPath);
    // Never write inside .git directories — corrupts refs (#1165)
    if (resolvedPath.includes('/.git/') || resolvedPath.includes('\\.git\\') || resolvedPath.endsWith('/.git') || resolvedPath.endsWith('\\.git'))
        return;
    var claudeMdPath = path_1.default.join(folderPath, 'CLAUDE.md');
    var tempFile = "".concat(claudeMdPath, ".tmp");
    // Only write to folders that already exist - never create new directories
    // This prevents creating spurious folder structures from malformed paths
    if (!(0, fs_1.existsSync)(folderPath)) {
        logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping non-existent folder', { folderPath: folderPath });
        return;
    }
    // Read existing content if file exists
    var existingContent = '';
    if ((0, fs_1.existsSync)(claudeMdPath)) {
        existingContent = (0, fs_1.readFileSync)(claudeMdPath, 'utf-8');
    }
    // Replace only tagged content, preserve user content
    var finalContent = replaceTaggedContent(existingContent, newContent);
    // Atomic write: temp file + rename
    (0, fs_1.writeFileSync)(tempFile, finalContent);
    (0, fs_1.renameSync)(tempFile, claudeMdPath);
}
/**
 * Format timeline text from API response to timeline format.
 *
 * Uses the same format as search results:
 * - Grouped by date (### Jan 4, 2026)
 * - Grouped by file within each date (**filename**)
 * - Table with columns: ID, Time, T (type emoji), Title, Read (tokens)
 * - Ditto marks for repeated times
 *
 * @param timelineText - Raw API response text
 * @returns Formatted markdown with date/file grouping
 */
function formatTimelineForClaudeMd(timelineText) {
    var lines = [];
    lines.push('# Recent Activity');
    lines.push('');
    // Parse the API response to extract observation rows
    var apiLines = timelineText.split('\n');
    // Note: We skip file grouping since we're querying by folder - all results are from the same folder
    // Parse observations: | #123 | 4:30 PM | 🔧 | Title | ~250 | ... |
    var observations = [];
    var lastTimeStr = '';
    var currentDate = null;
    for (var _i = 0, apiLines_1 = apiLines; _i < apiLines_1.length; _i++) {
        var line = apiLines_1[_i];
        // Check for date headers: ### Jan 4, 2026
        var dateMatch = line.match(/^###\s+(.+)$/);
        if (dateMatch) {
            var dateStr = dateMatch[1].trim();
            var parsedDate = new Date(dateStr);
            // Validate the parsed date
            if (!isNaN(parsedDate.getTime())) {
                currentDate = parsedDate;
            }
            continue;
        }
        // Match table rows: | #123 | 4:30 PM | 🔧 | Title | ~250 | ... |
        // Also handles ditto marks and session IDs (#S123)
        var match = line.match(/^\|\s*(#[S]?\d+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/);
        if (match) {
            var id = match[1], timeStr = match[2], typeEmoji = match[3], title = match[4], tokens = match[5];
            // Handle ditto mark (″) - use last time
            var time = void 0;
            if (timeStr.trim() === '″' || timeStr.trim() === '"') {
                time = lastTimeStr;
            }
            else {
                time = timeStr.trim();
                lastTimeStr = time;
            }
            // Parse time and combine with current date header (or fallback to today)
            var baseDate = currentDate ? new Date(currentDate) : new Date();
            var timeParts = time.match(/(\d+):(\d+)\s*(AM|PM)/i);
            var epoch = baseDate.getTime();
            if (timeParts) {
                var hours = parseInt(timeParts[1], 10);
                var minutes = parseInt(timeParts[2], 10);
                var isPM = timeParts[3].toUpperCase() === 'PM';
                if (isPM && hours !== 12)
                    hours += 12;
                if (!isPM && hours === 12)
                    hours = 0;
                baseDate.setHours(hours, minutes, 0, 0);
                epoch = baseDate.getTime();
            }
            observations.push({
                id: id.trim(),
                time: time,
                typeEmoji: typeEmoji.trim(),
                title: title.trim(),
                tokens: tokens.trim(),
                epoch: epoch
            });
        }
    }
    if (observations.length === 0) {
        return '';
    }
    // Group by date
    var byDate = (0, timeline_formatting_js_1.groupByDate)(observations, function (obs) { return new Date(obs.epoch).toISOString(); });
    // Render each date group
    for (var _a = 0, byDate_1 = byDate; _a < byDate_1.length; _a++) {
        var _b = byDate_1[_a], day = _b[0], dayObs = _b[1];
        lines.push("### ".concat(day));
        lines.push('');
        lines.push('| ID | Time | T | Title | Read |');
        lines.push('|----|------|---|-------|------|');
        var lastTime = '';
        for (var _c = 0, dayObs_1 = dayObs; _c < dayObs_1.length; _c++) {
            var obs = dayObs_1[_c];
            var timeDisplay = obs.time === lastTime ? '"' : obs.time;
            lastTime = obs.time;
            lines.push("| ".concat(obs.id, " | ").concat(timeDisplay, " | ").concat(obs.typeEmoji, " | ").concat(obs.title, " | ").concat(obs.tokens, " |"));
        }
        lines.push('');
    }
    return lines.join('\n').trim();
}
/**
 * Built-in directory names where CLAUDE.md generation is unsafe or undesirable.
 * e.g. Android res/ is compiler-strict (non-XML breaks build); .git, build, node_modules are tooling-owned.
 */
var EXCLUDED_UNSAFE_DIRECTORIES = new Set([
    'res',
    '.git',
    'build',
    'node_modules',
    '__pycache__'
]);
/**
 * Returns true if folder path contains any excluded segment (e.g. .../res/..., .../node_modules/...).
 */
function isExcludedUnsafeDirectory(folderPath) {
    var normalized = path_1.default.normalize(folderPath);
    var segments = normalized.split(path_1.default.sep);
    return segments.some(function (segment) { return EXCLUDED_UNSAFE_DIRECTORIES.has(segment); });
}
/**
 * Check if a folder is a project root (contains .git directory).
 * Project root CLAUDE.md files should remain user-managed, not auto-updated.
 */
function isProjectRoot(folderPath) {
    var gitPath = path_1.default.join(folderPath, '.git');
    return (0, fs_1.existsSync)(gitPath);
}
/**
 * Check if a folder path is excluded from CLAUDE.md generation.
 * A folder is excluded if it matches or is within any path in the exclude list.
 *
 * @param folderPath - Absolute path to check
 * @param excludePaths - Array of paths to exclude
 * @returns true if folder should be excluded
 */
function isExcludedFolder(folderPath, excludePaths) {
    var normalizedFolder = path_1.default.resolve(folderPath);
    for (var _i = 0, excludePaths_1 = excludePaths; _i < excludePaths_1.length; _i++) {
        var excludePath = excludePaths_1[_i];
        var normalizedExclude = path_1.default.resolve(excludePath);
        if (normalizedFolder === normalizedExclude ||
            normalizedFolder.startsWith(normalizedExclude + path_1.default.sep)) {
            return true;
        }
    }
    return false;
}
/**
 * Update CLAUDE.md files for folders containing the given files.
 * Fetches timeline from worker API and writes formatted content.
 *
 * NOTE: Project root folders (containing .git) are excluded to preserve
 * user-managed root CLAUDE.md files. Only subfolder CLAUDE.md files are auto-updated.
 *
 * @param filePaths - Array of absolute file paths (modified or read)
 * @param project - Project identifier for API query
 * @param _port - Worker API port (legacy, now resolved automatically via socket/TCP)
 */
function updateFolderClaudeMdFiles(filePaths, project, _port, projectRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var settings, limit, folderMdExcludePaths, parsed, foldersWithActiveClaudeMd, _i, filePaths_1, filePath, basename, absoluteFilePath, folderPath, folderPaths, _a, filePaths_2, filePath, absoluteFilePath, folderPath, _b, folderPaths_1, folderPath, response, result, formatted, claudeMdPath, hasNoActivity, fileExists, error_1, err;
        var _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(SETTINGS_PATH);
                    limit = parseInt(settings.CLAUDE_MEM_CONTEXT_OBSERVATIONS, 10) || 50;
                    folderMdExcludePaths = [];
                    try {
                        parsed = JSON.parse(settings.CLAUDE_MEM_FOLDER_MD_EXCLUDE || '[]');
                        if (Array.isArray(parsed)) {
                            folderMdExcludePaths = parsed.filter(function (p) { return typeof p === 'string'; });
                        }
                    }
                    catch (_f) {
                        logger_js_1.logger.warn('FOLDER_INDEX', 'Failed to parse CLAUDE_MEM_FOLDER_MD_EXCLUDE setting');
                    }
                    foldersWithActiveClaudeMd = new Set();
                    // First pass: identify folders with actively-used CLAUDE.md files
                    for (_i = 0, filePaths_1 = filePaths; _i < filePaths_1.length; _i++) {
                        filePath = filePaths_1[_i];
                        if (!filePath)
                            continue;
                        basename = path_1.default.basename(filePath);
                        if (basename === 'CLAUDE.md') {
                            absoluteFilePath = filePath;
                            if (projectRoot && !path_1.default.isAbsolute(filePath)) {
                                absoluteFilePath = path_1.default.join(projectRoot, filePath);
                            }
                            folderPath = path_1.default.dirname(absoluteFilePath);
                            foldersWithActiveClaudeMd.add(folderPath);
                            logger_js_1.logger.debug('FOLDER_INDEX', 'Detected active CLAUDE.md, will skip folder', { folderPath: folderPath });
                        }
                    }
                    folderPaths = new Set();
                    for (_a = 0, filePaths_2 = filePaths; _a < filePaths_2.length; _a++) {
                        filePath = filePaths_2[_a];
                        if (!filePath || filePath === '')
                            continue;
                        // VALIDATE PATH BEFORE PROCESSING
                        if (!isValidPathForClaudeMd(filePath, projectRoot)) {
                            logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping invalid file path', {
                                filePath: filePath,
                                reason: 'Failed path validation'
                            });
                            continue;
                        }
                        absoluteFilePath = filePath;
                        if (projectRoot && !path_1.default.isAbsolute(filePath)) {
                            absoluteFilePath = path_1.default.join(projectRoot, filePath);
                        }
                        folderPath = path_1.default.dirname(absoluteFilePath);
                        if (folderPath && folderPath !== '.' && folderPath !== '/') {
                            // Skip project root - root CLAUDE.md should remain user-managed
                            if (isProjectRoot(folderPath)) {
                                logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping project root CLAUDE.md', { folderPath: folderPath });
                                continue;
                            }
                            // Skip known-unsafe directories (e.g. Android res/, .git, build, node_modules)
                            if (isExcludedUnsafeDirectory(folderPath)) {
                                logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping unsafe directory for CLAUDE.md', { folderPath: folderPath });
                                continue;
                            }
                            // Skip folders where CLAUDE.md was read/modified in this observation (issue #859)
                            if (foldersWithActiveClaudeMd.has(folderPath)) {
                                logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping folder with active CLAUDE.md to avoid race condition', { folderPath: folderPath });
                                continue;
                            }
                            // Skip folders in user-configured exclude list
                            if (folderMdExcludePaths.length > 0 && isExcludedFolder(folderPath, folderMdExcludePaths)) {
                                logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping excluded folder', { folderPath: folderPath });
                                continue;
                            }
                            folderPaths.add(folderPath);
                        }
                    }
                    if (folderPaths.size === 0)
                        return [2 /*return*/];
                    logger_js_1.logger.debug('FOLDER_INDEX', 'Updating CLAUDE.md files', {
                        project: project,
                        folderCount: folderPaths.size
                    });
                    _b = 0, folderPaths_1 = folderPaths;
                    _e.label = 1;
                case 1:
                    if (!(_b < folderPaths_1.length)) return [3 /*break*/, 7];
                    folderPath = folderPaths_1[_b];
                    _e.label = 2;
                case 2:
                    _e.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)("/api/search/by-file?filePath=".concat(encodeURIComponent(folderPath), "&limit=").concat(limit, "&project=").concat(encodeURIComponent(project), "&isFolder=true"))];
                case 3:
                    response = _e.sent();
                    if (!response.ok) {
                        logger_js_1.logger.error('FOLDER_INDEX', 'Failed to fetch timeline', { folderPath: folderPath, status: response.status });
                        return [3 /*break*/, 6];
                    }
                    return [4 /*yield*/, response.json()];
                case 4:
                    result = _e.sent();
                    if (!((_d = (_c = result.content) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.text)) {
                        logger_js_1.logger.debug('FOLDER_INDEX', 'No content for folder', { folderPath: folderPath });
                        return [3 /*break*/, 6];
                    }
                    formatted = formatTimelineForClaudeMd(result.content[0].text);
                    claudeMdPath = path_1.default.join(folderPath, 'CLAUDE.md');
                    hasNoActivity = formatted.includes('*No recent activity*');
                    fileExists = (0, fs_1.existsSync)(claudeMdPath);
                    if (hasNoActivity && !fileExists) {
                        logger_js_1.logger.debug('FOLDER_INDEX', 'Skipping empty CLAUDE.md creation', { folderPath: folderPath });
                        return [3 /*break*/, 6];
                    }
                    writeClaudeMdToFolder(folderPath, formatted);
                    logger_js_1.logger.debug('FOLDER_INDEX', 'Updated CLAUDE.md', { folderPath: folderPath });
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _e.sent();
                    err = error_1;
                    logger_js_1.logger.error('FOLDER_INDEX', 'Failed to update CLAUDE.md', {
                        folderPath: folderPath,
                        errorMessage: err.message,
                        errorStack: err.stack
                    });
                    return [3 /*break*/, 6];
                case 6:
                    _b++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
