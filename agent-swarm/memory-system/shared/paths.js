"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CLAUDE_MD_PATH = exports.CLAUDE_COMMANDS_DIR = exports.CLAUDE_SETTINGS_PATH = exports.OBSERVER_SESSIONS_DIR = exports.VECTOR_DB_DIR = exports.DB_PATH = exports.USER_SETTINGS_PATH = exports.MODES_DIR = exports.BACKUPS_DIR = exports.TRASH_DIR = exports.LOGS_DIR = exports.ARCHIVES_DIR = exports.MARKETPLACE_ROOT = exports.CLAUDE_CONFIG_DIR = exports.DATA_DIR = void 0;
exports.getProjectArchiveDir = getProjectArchiveDir;
exports.getWorkerSocketPath = getWorkerSocketPath;
exports.ensureDir = ensureDir;
exports.ensureAllDataDirs = ensureAllDataDirs;
exports.ensureModesDir = ensureModesDir;
exports.ensureAllClaudeDirs = ensureAllClaudeDirs;
exports.getCurrentProjectName = getCurrentProjectName;
exports.getPackageRoot = getPackageRoot;
exports.getPackageCommandsDir = getPackageCommandsDir;
exports.createBackupFilename = createBackupFilename;
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var url_1 = require("url");
var logger_js_1 = require("../utils/logger.js");
// Get __dirname that works in both ESM (hooks) and CJS (worker) contexts
function getDirname() {
    // CJS context - __dirname exists
    if (typeof __dirname !== 'undefined') {
        return __dirname;
    }
    // ESM context - use import.meta.url
    return (0, path_1.dirname)((0, url_1.fileURLToPath)(import.meta.url));
}
var _dirname = getDirname();
/**
 * Simple path configuration for claude-mem
 * Standard paths based on Claude Code conventions
 */
// Base directories
// Resolve DATA_DIR with full priority: env var > settings.json > default.
// SettingsDefaultsManager.get() handles env > default. For settings file
// support, we do a one-time synchronous read of the default settings path
// to check if the user configured a custom DATA_DIR there.
function resolveDataDir() {
    var _a;
    // 1. Environment variable (highest priority) — already handled by get()
    if (process.env.CLAUDE_MEM_DATA_DIR) {
        return process.env.CLAUDE_MEM_DATA_DIR;
    }
    // 2. Settings file at the default location
    var defaultDataDir = (0, path_1.join)((0, os_1.homedir)(), '.claude-mem');
    var settingsPath = (0, path_1.join)(defaultDataDir, 'settings.json');
    try {
        if ((0, fs_1.existsSync)(settingsPath)) {
            var readFileSync = require('fs').readFileSync;
            var raw = JSON.parse(readFileSync(settingsPath, 'utf-8'));
            var settings = (_a = raw.env) !== null && _a !== void 0 ? _a : raw; // handle legacy nested schema
            if (settings.CLAUDE_MEM_DATA_DIR) {
                return settings.CLAUDE_MEM_DATA_DIR;
            }
        }
    }
    catch (_b) {
        // settings file missing or corrupt — fall through to default
    }
    // 3. Hardcoded default
    return defaultDataDir;
}
exports.DATA_DIR = resolveDataDir();
// Note: CLAUDE_CONFIG_DIR is a Claude Code setting, not claude-mem, so leave as env var
exports.CLAUDE_CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || (0, path_1.join)((0, os_1.homedir)(), '.claude');
// Plugin installation directory - respects CLAUDE_CONFIG_DIR for users with custom Claude locations
exports.MARKETPLACE_ROOT = (0, path_1.join)(exports.CLAUDE_CONFIG_DIR, 'plugins', 'marketplaces', 'thedotmack');
// Data subdirectories
exports.ARCHIVES_DIR = (0, path_1.join)(exports.DATA_DIR, 'archives');
exports.LOGS_DIR = (0, path_1.join)(exports.DATA_DIR, 'logs');
exports.TRASH_DIR = (0, path_1.join)(exports.DATA_DIR, 'trash');
exports.BACKUPS_DIR = (0, path_1.join)(exports.DATA_DIR, 'backups');
exports.MODES_DIR = (0, path_1.join)(exports.DATA_DIR, 'modes');
exports.USER_SETTINGS_PATH = (0, path_1.join)(exports.DATA_DIR, 'settings.json');
exports.DB_PATH = (0, path_1.join)(exports.DATA_DIR, 'claude-mem.db');
exports.VECTOR_DB_DIR = (0, path_1.join)(exports.DATA_DIR, 'vector-db');
// Observer sessions directory - used as cwd for SDK queries
// Sessions here won't appear in user's `claude --resume` for their actual projects
exports.OBSERVER_SESSIONS_DIR = (0, path_1.join)(exports.DATA_DIR, 'observer-sessions');
// Claude integration paths
exports.CLAUDE_SETTINGS_PATH = (0, path_1.join)(exports.CLAUDE_CONFIG_DIR, 'settings.json');
exports.CLAUDE_COMMANDS_DIR = (0, path_1.join)(exports.CLAUDE_CONFIG_DIR, 'commands');
exports.CLAUDE_MD_PATH = (0, path_1.join)(exports.CLAUDE_CONFIG_DIR, 'CLAUDE.md');
/**
 * Get project-specific archive directory
 */
function getProjectArchiveDir(projectName) {
    return (0, path_1.join)(exports.ARCHIVES_DIR, projectName);
}
/**
 * Get worker socket path for a session
 */
function getWorkerSocketPath(sessionId) {
    return (0, path_1.join)(exports.DATA_DIR, "worker-".concat(sessionId, ".sock"));
}
/**
 * Ensure a directory exists
 */
function ensureDir(dirPath) {
    (0, fs_1.mkdirSync)(dirPath, { recursive: true });
}
/**
 * Ensure all data directories exist
 */
function ensureAllDataDirs() {
    ensureDir(exports.DATA_DIR);
    ensureDir(exports.ARCHIVES_DIR);
    ensureDir(exports.LOGS_DIR);
    ensureDir(exports.TRASH_DIR);
    ensureDir(exports.BACKUPS_DIR);
    ensureDir(exports.MODES_DIR);
}
/**
 * Ensure modes directory exists
 */
function ensureModesDir() {
    ensureDir(exports.MODES_DIR);
}
/**
 * Ensure all Claude integration directories exist
 */
function ensureAllClaudeDirs() {
    ensureDir(exports.CLAUDE_CONFIG_DIR);
    ensureDir(exports.CLAUDE_COMMANDS_DIR);
}
/**
 * Get current project name from git root or cwd.
 * Includes parent directory to avoid collisions when repos share a folder name
 * (e.g., ~/work/monorepo → "work/monorepo" vs ~/personal/monorepo → "personal/monorepo").
 */
function getCurrentProjectName() {
    try {
        var gitRoot = (0, child_process_1.execSync)('git rev-parse --show-toplevel', {
            cwd: process.cwd(),
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'ignore'],
            windowsHide: true
        }).trim();
        return (0, path_1.basename)((0, path_1.dirname)(gitRoot)) + '/' + (0, path_1.basename)(gitRoot);
    }
    catch (error) {
        logger_js_1.logger.debug('SYSTEM', 'Git root detection failed, using cwd basename', {
            cwd: process.cwd()
        }, error);
        var cwd = process.cwd();
        return (0, path_1.basename)((0, path_1.dirname)(cwd)) + '/' + (0, path_1.basename)(cwd);
    }
}
/**
 * Find package root directory
 *
 * Works because bundled hooks are in plugin/scripts/,
 * so package root is always one level up (the plugin directory)
 */
function getPackageRoot() {
    return (0, path_1.join)(_dirname, '..');
}
/**
 * Find commands directory in the installed package
 */
function getPackageCommandsDir() {
    var packageRoot = getPackageRoot();
    return (0, path_1.join)(packageRoot, 'commands');
}
/**
 * Create a timestamped backup filename
 */
function createBackupFilename(originalPath) {
    var timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .replace('T', '_')
        .slice(0, 19);
    return "".concat(originalPath, ".backup.").concat(timestamp);
}
