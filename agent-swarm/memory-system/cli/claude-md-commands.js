"use strict";
/**
 * CLAUDE.md Generation and Cleanup Commands
 *
 * Shared module for CLAUDE.md file management that can be invoked from:
 * - CLI: `claude-mem generate` / `claude-mem clean`
 * - Worker service API endpoints
 *
 * Provides two main operations:
 * - generateClaudeMd: Regenerate CLAUDE.md files for folders with observations
 * - cleanClaudeMd: Remove auto-generated content from CLAUDE.md files
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
exports.generateClaudeMd = generateClaudeMd;
exports.cleanClaudeMd = cleanClaudeMd;
var bun_sqlite_1 = require("bun:sqlite");
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var SettingsDefaultsManager_js_1 = require("../shared/SettingsDefaultsManager.js");
var timeline_formatting_js_1 = require("../shared/timeline-formatting.js");
var path_utils_js_1 = require("../shared/path-utils.js");
var logger_js_1 = require("../utils/logger.js");
var DB_PATH = path_1.default.join(os_1.default.homedir(), '.claude-mem', 'claude-mem.db');
var SETTINGS_PATH = path_1.default.join(os_1.default.homedir(), '.claude-mem', 'settings.json');
// Type icon map (matches ModeManager)
var TYPE_ICONS = {
    'bugfix': '🔴',
    'feature': '🟣',
    'refactor': '🔄',
    'change': '✅',
    'discovery': '🔵',
    'decision': '⚖️',
    'session': '🎯',
    'prompt': '💬'
};
function getTypeIcon(type) {
    return TYPE_ICONS[type] || '📝';
}
function estimateTokens(obs) {
    var _a, _b, _c, _d;
    var size = (((_a = obs.title) === null || _a === void 0 ? void 0 : _a.length) || 0) +
        (((_b = obs.subtitle) === null || _b === void 0 ? void 0 : _b.length) || 0) +
        (((_c = obs.narrative) === null || _c === void 0 ? void 0 : _c.length) || 0) +
        (((_d = obs.facts) === null || _d === void 0 ? void 0 : _d.length) || 0);
    return Math.ceil(size / 4);
}
/**
 * Get tracked folders using git ls-files.
 * Respects .gitignore and only returns folders within the project.
 */
function getTrackedFolders(workingDir) {
    var folders = new Set();
    try {
        var output = (0, child_process_1.execSync)('git ls-files', {
            cwd: workingDir,
            encoding: 'utf-8',
            maxBuffer: 50 * 1024 * 1024
        });
        var files = output.trim().split('\n').filter(function (f) { return f; });
        for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
            var file = files_1[_i];
            var absPath = path_1.default.join(workingDir, file);
            var dir = path_1.default.dirname(absPath);
            while (dir.length > workingDir.length && dir.startsWith(workingDir)) {
                folders.add(dir);
                dir = path_1.default.dirname(dir);
            }
        }
    }
    catch (error) {
        logger_js_1.logger.warn('CLAUDE_MD', 'git ls-files failed, falling back to directory walk', { error: String(error) });
        walkDirectoriesWithIgnore(workingDir, folders);
    }
    return folders;
}
/**
 * Fallback directory walker that skips common ignored patterns.
 */
function walkDirectoriesWithIgnore(dir, folders, depth) {
    if (depth === void 0) { depth = 0; }
    if (depth > 10)
        return;
    var ignorePatterns = [
        'node_modules', '.git', '.next', 'dist', 'build', '.cache',
        '__pycache__', '.venv', 'venv', '.idea', '.vscode', 'coverage',
        '.claude-mem', '.open-next', '.turbo'
    ];
    try {
        var entries = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
        for (var _i = 0, entries_1 = entries; _i < entries_1.length; _i++) {
            var entry = entries_1[_i];
            if (!entry.isDirectory())
                continue;
            if (ignorePatterns.includes(entry.name))
                continue;
            if (entry.name.startsWith('.') && entry.name !== '.claude')
                continue;
            var fullPath = path_1.default.join(dir, entry.name);
            folders.add(fullPath);
            walkDirectoriesWithIgnore(fullPath, folders, depth + 1);
        }
    }
    catch (_a) {
        // Ignore permission errors
    }
}
/**
 * Check if an observation has any files that are direct children of the folder.
 */
function hasDirectChildFile(obs, folderPath) {
    var checkFiles = function (filesJson) {
        if (!filesJson)
            return false;
        try {
            var files = JSON.parse(filesJson);
            if (Array.isArray(files)) {
                return files.some(function (f) { return (0, path_utils_js_1.isDirectChild)(f, folderPath); });
            }
        }
        catch (_a) { }
        return false;
    };
    return checkFiles(obs.files_modified) || checkFiles(obs.files_read);
}
/**
 * Query observations for a specific folder.
 * Only returns observations with files directly in the folder (not in subfolders).
 */
function findObservationsByFolder(db, relativeFolderPath, project, limit) {
    var queryLimit = limit * 3;
    var sql = "\n    SELECT o.*, o.discovery_tokens\n    FROM observations o\n    WHERE o.project = ?\n      AND (o.files_modified LIKE ? OR o.files_read LIKE ?)\n    ORDER BY o.created_at_epoch DESC\n    LIMIT ?\n  ";
    // Database stores paths with forward slashes (git-normalized)
    var normalizedFolderPath = relativeFolderPath.split(path_1.default.sep).join('/');
    var likePattern = "%\"".concat(normalizedFolderPath, "/%");
    var allMatches = db.prepare(sql).all(project, likePattern, likePattern, queryLimit);
    return allMatches.filter(function (obs) { return hasDirectChildFile(obs, relativeFolderPath); }).slice(0, limit);
}
/**
 * Extract relevant file from an observation for display.
 * Only returns files that are direct children of the folder.
 */
function extractRelevantFile(obs, relativeFolder) {
    if (obs.files_modified) {
        try {
            var modified = JSON.parse(obs.files_modified);
            if (Array.isArray(modified)) {
                for (var _i = 0, modified_1 = modified; _i < modified_1.length; _i++) {
                    var file = modified_1[_i];
                    if ((0, path_utils_js_1.isDirectChild)(file, relativeFolder)) {
                        return path_1.default.basename(file);
                    }
                }
            }
        }
        catch (_a) { }
    }
    if (obs.files_read) {
        try {
            var read = JSON.parse(obs.files_read);
            if (Array.isArray(read)) {
                for (var _b = 0, read_1 = read; _b < read_1.length; _b++) {
                    var file = read_1[_b];
                    if ((0, path_utils_js_1.isDirectChild)(file, relativeFolder)) {
                        return path_1.default.basename(file);
                    }
                }
            }
        }
        catch (_c) { }
    }
    return 'General';
}
/**
 * Format observations for CLAUDE.md content.
 */
function formatObservationsForClaudeMd(observations, folderPath) {
    var lines = [];
    lines.push('# Recent Activity');
    lines.push('');
    lines.push('<!-- This section is auto-generated by claude-mem. Edit content outside the tags. -->');
    lines.push('');
    if (observations.length === 0) {
        lines.push('*No recent activity*');
        return lines.join('\n');
    }
    var byDate = (0, timeline_formatting_js_1.groupByDate)(observations, function (obs) { return obs.created_at; });
    for (var _i = 0, byDate_1 = byDate; _i < byDate_1.length; _i++) {
        var _a = byDate_1[_i], day = _a[0], dayObs = _a[1];
        lines.push("### ".concat(day));
        lines.push('');
        var byFile = new Map();
        for (var _b = 0, dayObs_1 = dayObs; _b < dayObs_1.length; _b++) {
            var obs = dayObs_1[_b];
            var file = extractRelevantFile(obs, folderPath);
            if (!byFile.has(file))
                byFile.set(file, []);
            byFile.get(file).push(obs);
        }
        for (var _c = 0, byFile_1 = byFile; _c < byFile_1.length; _c++) {
            var _d = byFile_1[_c], file = _d[0], fileObs = _d[1];
            lines.push("**".concat(file, "**"));
            lines.push('| ID | Time | T | Title | Read |');
            lines.push('|----|------|---|-------|------|');
            var lastTime = '';
            for (var _e = 0, fileObs_1 = fileObs; _e < fileObs_1.length; _e++) {
                var obs = fileObs_1[_e];
                var time = (0, timeline_formatting_js_1.formatTime)(obs.created_at_epoch);
                var timeDisplay = time === lastTime ? '"' : time;
                lastTime = time;
                var icon = getTypeIcon(obs.type);
                var title = obs.title || 'Untitled';
                var tokens = estimateTokens(obs);
                lines.push("| #".concat(obs.id, " | ").concat(timeDisplay, " | ").concat(icon, " | ").concat(title, " | ~").concat(tokens, " |"));
            }
            lines.push('');
        }
    }
    return lines.join('\n').trim();
}
/**
 * Write CLAUDE.md file with tagged content preservation.
 * Only writes to folders that exist — never creates directories.
 */
function writeClaudeMdToFolder(folderPath, newContent) {
    var resolvedPath = path_1.default.resolve(folderPath);
    // Never write inside .git directories — corrupts refs (#1165)
    if (resolvedPath.includes('/.git/') || resolvedPath.includes('\\.git\\') || resolvedPath.endsWith('/.git') || resolvedPath.endsWith('\\.git'))
        return;
    var claudeMdPath = path_1.default.join(folderPath, 'CLAUDE.md');
    var tempFile = "".concat(claudeMdPath, ".tmp");
    if (!(0, fs_1.existsSync)(folderPath)) {
        throw new Error("Folder does not exist: ".concat(folderPath));
    }
    var existingContent = '';
    if ((0, fs_1.existsSync)(claudeMdPath)) {
        existingContent = (0, fs_1.readFileSync)(claudeMdPath, 'utf-8');
    }
    var startTag = '<claude-mem-context>';
    var endTag = '</claude-mem-context>';
    var finalContent;
    if (!existingContent) {
        finalContent = "".concat(startTag, "\n").concat(newContent, "\n").concat(endTag);
    }
    else {
        var startIdx = existingContent.indexOf(startTag);
        var endIdx = existingContent.indexOf(endTag);
        if (startIdx !== -1 && endIdx !== -1) {
            finalContent = existingContent.substring(0, startIdx) +
                "".concat(startTag, "\n").concat(newContent, "\n").concat(endTag) +
                existingContent.substring(endIdx + endTag.length);
        }
        else {
            finalContent = existingContent + "\n\n".concat(startTag, "\n").concat(newContent, "\n").concat(endTag);
        }
    }
    (0, fs_1.writeFileSync)(tempFile, finalContent);
    (0, fs_1.renameSync)(tempFile, claudeMdPath);
}
/**
 * Regenerate CLAUDE.md for a single folder.
 */
function regenerateFolder(db, absoluteFolder, relativeFolder, project, dryRun, workingDir, observationLimit) {
    try {
        if (!(0, fs_1.existsSync)(absoluteFolder)) {
            return { success: false, observationCount: 0, error: 'Folder no longer exists' };
        }
        // Validate folder is within project root (prevent path traversal)
        var resolvedFolder = path_1.default.resolve(absoluteFolder);
        var resolvedWorkingDir = path_1.default.resolve(workingDir);
        if (!resolvedFolder.startsWith(resolvedWorkingDir + path_1.default.sep)) {
            return { success: false, observationCount: 0, error: 'Path escapes project root' };
        }
        var observations = findObservationsByFolder(db, relativeFolder, project, observationLimit);
        if (observations.length === 0) {
            return { success: false, observationCount: 0, error: 'No observations for folder' };
        }
        if (dryRun) {
            return { success: true, observationCount: observations.length };
        }
        var formatted = formatObservationsForClaudeMd(observations, relativeFolder);
        writeClaudeMdToFolder(absoluteFolder, formatted);
        return { success: true, observationCount: observations.length };
    }
    catch (error) {
        return { success: false, observationCount: 0, error: String(error) };
    }
}
/**
 * Generate CLAUDE.md files for all folders with observations.
 *
 * @param dryRun - If true, only report what would be done without writing files
 * @returns Exit code (0 for success, 1 for error)
 */
function generateClaudeMd(dryRun) {
    return __awaiter(this, void 0, void 0, function () {
        var workingDir, settings, observationLimit, project, trackedFolders, db, successCount, skipCount, errorCount, foldersArray, _i, foldersArray_1, absoluteFolder, relativeFolder, result;
        var _a;
        return __generator(this, function (_b) {
            try {
                workingDir = process.cwd();
                settings = SettingsDefaultsManager_js_1.SettingsDefaultsManager.loadFromFile(SETTINGS_PATH);
                observationLimit = parseInt(settings.CLAUDE_MEM_CONTEXT_OBSERVATIONS, 10) || 50;
                logger_js_1.logger.info('CLAUDE_MD', 'Starting CLAUDE.md generation', {
                    workingDir: workingDir,
                    dryRun: dryRun,
                    observationLimit: observationLimit
                });
                project = path_1.default.basename(workingDir);
                trackedFolders = getTrackedFolders(workingDir);
                if (trackedFolders.size === 0) {
                    logger_js_1.logger.info('CLAUDE_MD', 'No folders found in project');
                    return [2 /*return*/, 0];
                }
                logger_js_1.logger.info('CLAUDE_MD', "Found ".concat(trackedFolders.size, " folders in project"));
                if (!(0, fs_1.existsSync)(DB_PATH)) {
                    logger_js_1.logger.info('CLAUDE_MD', 'Database not found, no observations to process');
                    return [2 /*return*/, 0];
                }
                db = new bun_sqlite_1.Database(DB_PATH, { readonly: true, create: false });
                successCount = 0;
                skipCount = 0;
                errorCount = 0;
                foldersArray = Array.from(trackedFolders).sort();
                for (_i = 0, foldersArray_1 = foldersArray; _i < foldersArray_1.length; _i++) {
                    absoluteFolder = foldersArray_1[_i];
                    relativeFolder = path_1.default.relative(workingDir, absoluteFolder);
                    result = regenerateFolder(db, absoluteFolder, relativeFolder, project, dryRun, workingDir, observationLimit);
                    if (result.success) {
                        logger_js_1.logger.debug('CLAUDE_MD', "Processed folder: ".concat(relativeFolder), {
                            observationCount: result.observationCount
                        });
                        successCount++;
                    }
                    else if ((_a = result.error) === null || _a === void 0 ? void 0 : _a.includes('No observations')) {
                        skipCount++;
                    }
                    else {
                        logger_js_1.logger.warn('CLAUDE_MD', "Error processing folder: ".concat(relativeFolder), {
                            error: result.error
                        });
                        errorCount++;
                    }
                }
                db.close();
                logger_js_1.logger.info('CLAUDE_MD', 'CLAUDE.md generation complete', {
                    totalFolders: foldersArray.length,
                    withObservations: successCount,
                    noObservations: skipCount,
                    errors: errorCount,
                    dryRun: dryRun
                });
                return [2 /*return*/, 0];
            }
            catch (error) {
                logger_js_1.logger.error('CLAUDE_MD', 'Fatal error during CLAUDE.md generation', {
                    error: String(error)
                });
                return [2 /*return*/, 1];
            }
            return [2 /*return*/];
        });
    });
}
/**
 * Clean up auto-generated CLAUDE.md files.
 *
 * For each file with <claude-mem-context> tags:
 * - Strip the tagged section
 * - If empty after stripping, delete the file
 * - If has remaining content, save the stripped version
 *
 * @param dryRun - If true, only report what would be done without modifying files
 * @returns Exit code (0 for success, 1 for error)
 */
function cleanClaudeMd(dryRun) {
    return __awaiter(this, void 0, void 0, function () {
        function walkForClaudeMd(dir) {
            var ignorePatterns = [
                'node_modules', '.git', '.next', 'dist', 'build', '.cache',
                '__pycache__', '.venv', 'venv', '.idea', '.vscode', 'coverage',
                '.claude-mem', '.open-next', '.turbo'
            ];
            try {
                var entries = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
                for (var _i = 0, entries_2 = entries; _i < entries_2.length; _i++) {
                    var entry = entries_2[_i];
                    var fullPath = path_1.default.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (!ignorePatterns.includes(entry.name)) {
                            walkForClaudeMd(fullPath);
                        }
                    }
                    else if (entry.name === 'CLAUDE.md') {
                        try {
                            var content = (0, fs_1.readFileSync)(fullPath, 'utf-8');
                            if (content.includes('<claude-mem-context>')) {
                                filesToProcess_2.push(fullPath);
                            }
                        }
                        catch (_a) {
                            // Skip files we can't read
                        }
                    }
                }
            }
            catch (_b) {
                // Ignore permission errors
            }
        }
        var workingDir, filesToProcess_2, deletedCount, cleanedCount, errorCount, _i, filesToProcess_1, file, relativePath, content, stripped;
        return __generator(this, function (_a) {
            try {
                workingDir = process.cwd();
                logger_js_1.logger.info('CLAUDE_MD', 'Starting CLAUDE.md cleanup', {
                    workingDir: workingDir,
                    dryRun: dryRun
                });
                filesToProcess_2 = [];
                walkForClaudeMd(workingDir);
                if (filesToProcess_2.length === 0) {
                    logger_js_1.logger.info('CLAUDE_MD', 'No CLAUDE.md files with auto-generated content found');
                    return [2 /*return*/, 0];
                }
                logger_js_1.logger.info('CLAUDE_MD', "Found ".concat(filesToProcess_2.length, " CLAUDE.md files with auto-generated content"));
                deletedCount = 0;
                cleanedCount = 0;
                errorCount = 0;
                for (_i = 0, filesToProcess_1 = filesToProcess_2; _i < filesToProcess_1.length; _i++) {
                    file = filesToProcess_1[_i];
                    relativePath = path_1.default.relative(workingDir, file);
                    try {
                        content = (0, fs_1.readFileSync)(file, 'utf-8');
                        stripped = content.replace(/<claude-mem-context>[\s\S]*?<\/claude-mem-context>/g, '').trim();
                        if (stripped === '') {
                            if (!dryRun) {
                                (0, fs_1.unlinkSync)(file);
                            }
                            logger_js_1.logger.debug('CLAUDE_MD', "".concat(dryRun ? '[DRY-RUN] Would delete' : 'Deleted', " (empty): ").concat(relativePath));
                            deletedCount++;
                        }
                        else {
                            if (!dryRun) {
                                (0, fs_1.writeFileSync)(file, stripped);
                            }
                            logger_js_1.logger.debug('CLAUDE_MD', "".concat(dryRun ? '[DRY-RUN] Would clean' : 'Cleaned', ": ").concat(relativePath));
                            cleanedCount++;
                        }
                    }
                    catch (error) {
                        logger_js_1.logger.warn('CLAUDE_MD', "Error processing ".concat(relativePath), { error: String(error) });
                        errorCount++;
                    }
                }
                logger_js_1.logger.info('CLAUDE_MD', 'CLAUDE.md cleanup complete', {
                    deleted: deletedCount,
                    cleaned: cleanedCount,
                    errors: errorCount,
                    dryRun: dryRun
                });
                return [2 /*return*/, 0];
            }
            catch (error) {
                logger_js_1.logger.error('CLAUDE_MD', 'Fatal error during CLAUDE.md cleanup', {
                    error: String(error)
                });
                return [2 /*return*/, 1];
            }
            return [2 /*return*/];
        });
    });
}
