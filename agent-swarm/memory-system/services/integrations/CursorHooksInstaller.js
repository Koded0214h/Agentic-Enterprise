"use strict";
/**
 * CursorHooksInstaller - Cursor IDE integration for claude-mem
 *
 * Extracted from worker-service.ts monolith to provide centralized Cursor integration.
 * Handles:
 * - Cursor hooks installation/uninstallation
 * - MCP server configuration
 * - Context file generation
 * - Project registry management
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
exports.detectPlatform = detectPlatform;
exports.getScriptExtension = getScriptExtension;
exports.readCursorRegistry = readCursorRegistry;
exports.writeCursorRegistry = writeCursorRegistry;
exports.registerCursorProject = registerCursorProject;
exports.unregisterCursorProject = unregisterCursorProject;
exports.updateCursorContextForProject = updateCursorContextForProject;
exports.findMcpServerPath = findMcpServerPath;
exports.findWorkerServicePath = findWorkerServicePath;
exports.findBunPath = findBunPath;
exports.getTargetDir = getTargetDir;
exports.configureCursorMcp = configureCursorMcp;
exports.installCursorHooks = installCursorHooks;
exports.uninstallCursorHooks = uninstallCursorHooks;
exports.checkCursorHooksStatus = checkCursorHooksStatus;
exports.detectClaudeCode = detectClaudeCode;
exports.handleCursorCommand = handleCursorCommand;
var path_1 = require("path");
var os_1 = require("os");
var fs_1 = require("fs");
var child_process_1 = require("child_process");
var util_1 = require("util");
var logger_js_1 = require("../../utils/logger.js");
var worker_utils_js_1 = require("../../shared/worker-utils.js");
var paths_js_1 = require("../../shared/paths.js");
var cursor_utils_js_1 = require("../../utils/cursor-utils.js");
var execAsync = (0, util_1.promisify)(child_process_1.exec);
// Standard paths
var CURSOR_REGISTRY_FILE = path_1.default.join(paths_js_1.DATA_DIR, 'cursor-projects.json');
// ============================================================================
// Platform Detection
// ============================================================================
/**
 * Detect platform for script selection
 */
function detectPlatform() {
    return process.platform === 'win32' ? 'windows' : 'unix';
}
/**
 * Get script extension based on platform
 */
function getScriptExtension() {
    return detectPlatform() === 'windows' ? '.ps1' : '.sh';
}
// ============================================================================
// Project Registry
// ============================================================================
/**
 * Read the Cursor project registry
 */
function readCursorRegistry() {
    return (0, cursor_utils_js_1.readCursorRegistry)(CURSOR_REGISTRY_FILE);
}
/**
 * Write the Cursor project registry
 */
function writeCursorRegistry(registry) {
    (0, cursor_utils_js_1.writeCursorRegistry)(CURSOR_REGISTRY_FILE, registry);
}
/**
 * Register a project for auto-context updates
 */
function registerCursorProject(projectName, workspacePath) {
    var registry = readCursorRegistry();
    registry[projectName] = {
        workspacePath: workspacePath,
        installedAt: new Date().toISOString()
    };
    writeCursorRegistry(registry);
    logger_js_1.logger.info('CURSOR', 'Registered project for auto-context updates', { projectName: projectName, workspacePath: workspacePath });
}
/**
 * Unregister a project from auto-context updates
 */
function unregisterCursorProject(projectName) {
    var registry = readCursorRegistry();
    if (registry[projectName]) {
        delete registry[projectName];
        writeCursorRegistry(registry);
        logger_js_1.logger.info('CURSOR', 'Unregistered project', { projectName: projectName });
    }
}
/**
 * Update Cursor context files for all registered projects matching this project name.
 * Called by SDK agents after saving a summary.
 */
function updateCursorContextForProject(projectName, _port) {
    return __awaiter(this, void 0, void 0, function () {
        var registry, entry, response, context, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    registry = readCursorRegistry();
                    entry = registry[projectName];
                    if (!entry)
                        return [2 /*return*/]; // Project doesn't have Cursor hooks installed
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)("/api/context/inject?project=".concat(encodeURIComponent(projectName)))];
                case 2:
                    response = _a.sent();
                    if (!response.ok)
                        return [2 /*return*/];
                    return [4 /*yield*/, response.text()];
                case 3:
                    context = _a.sent();
                    if (!context || !context.trim())
                        return [2 /*return*/];
                    // Write to the project's Cursor rules file using shared utility
                    (0, cursor_utils_js_1.writeContextFile)(entry.workspacePath, context);
                    logger_js_1.logger.debug('CURSOR', 'Updated context file', { projectName: projectName, workspacePath: entry.workspacePath });
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    // [ANTI-PATTERN IGNORED]: Background context update - failure is non-critical, user workflow continues
                    logger_js_1.logger.error('CURSOR', 'Failed to update context file', { projectName: projectName }, error_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
// ============================================================================
// Path Finding
// ============================================================================
/**
 * Find MCP server script path
 * Searches in order: marketplace install, source repo
 */
function findMcpServerPath() {
    var possiblePaths = [
        // Marketplace install location
        path_1.default.join(paths_js_1.MARKETPLACE_ROOT, 'plugin', 'scripts', 'mcp-server.cjs'),
        // Development/source location (relative to built worker-service.cjs in plugin/scripts/)
        path_1.default.join(path_1.default.dirname(__filename), 'mcp-server.cjs'),
        // Alternative dev location
        path_1.default.join(process.cwd(), 'plugin', 'scripts', 'mcp-server.cjs'),
    ];
    for (var _i = 0, possiblePaths_1 = possiblePaths; _i < possiblePaths_1.length; _i++) {
        var p = possiblePaths_1[_i];
        if ((0, fs_1.existsSync)(p)) {
            return p;
        }
    }
    return null;
}
/**
 * Find worker-service.cjs path for unified CLI
 * Searches in order: marketplace install, source repo
 */
function findWorkerServicePath() {
    var possiblePaths = [
        // Marketplace install location
        path_1.default.join(paths_js_1.MARKETPLACE_ROOT, 'plugin', 'scripts', 'worker-service.cjs'),
        // Development/source location (relative to built worker-service.cjs in plugin/scripts/)
        path_1.default.join(path_1.default.dirname(__filename), 'worker-service.cjs'),
        // Alternative dev location
        path_1.default.join(process.cwd(), 'plugin', 'scripts', 'worker-service.cjs'),
    ];
    for (var _i = 0, possiblePaths_2 = possiblePaths; _i < possiblePaths_2.length; _i++) {
        var p = possiblePaths_2[_i];
        if ((0, fs_1.existsSync)(p)) {
            return p;
        }
    }
    return null;
}
/**
 * Find the Bun executable path
 * Required because worker-service.cjs uses bun:sqlite which is Bun-specific
 * Searches common installation locations across platforms
 */
function findBunPath() {
    var possiblePaths = __spreadArray([
        // Standard user install location (most common)
        path_1.default.join((0, os_1.homedir)(), '.bun', 'bin', 'bun'),
        // Global install locations
        '/usr/local/bin/bun',
        '/usr/bin/bun'
    ], (process.platform === 'win32' ? [
        path_1.default.join((0, os_1.homedir)(), '.bun', 'bin', 'bun.exe'),
        path_1.default.join(process.env.LOCALAPPDATA || '', 'bun', 'bun.exe'),
    ] : []), true);
    for (var _i = 0, possiblePaths_3 = possiblePaths; _i < possiblePaths_3.length; _i++) {
        var p = possiblePaths_3[_i];
        if (p && (0, fs_1.existsSync)(p)) {
            return p;
        }
    }
    // Fallback to 'bun' and hope it's in PATH
    // This allows the installation to proceed even if we can't find bun
    // The user will get a clear error when the hook runs if bun isn't available
    return 'bun';
}
/**
 * Get the target directory for Cursor hooks based on install target
 */
function getTargetDir(target) {
    switch (target) {
        case 'project':
            return path_1.default.join(process.cwd(), '.cursor');
        case 'user':
            return path_1.default.join((0, os_1.homedir)(), '.cursor');
        case 'enterprise':
            if (process.platform === 'darwin') {
                return '/Library/Application Support/Cursor';
            }
            else if (process.platform === 'linux') {
                return '/etc/cursor';
            }
            else if (process.platform === 'win32') {
                return path_1.default.join(process.env.ProgramData || 'C:\\ProgramData', 'Cursor');
            }
            return null;
        default:
            return null;
    }
}
// ============================================================================
// MCP Configuration
// ============================================================================
/**
 * Configure MCP server in Cursor's mcp.json
 * @param target 'project' or 'user'
 * @returns 0 on success, 1 on failure
 */
function configureCursorMcp(target) {
    var mcpServerPath = findMcpServerPath();
    if (!mcpServerPath) {
        console.error('Could not find MCP server script');
        console.error('   Expected at: ~/.claude/plugins/marketplaces/thedotmack/plugin/scripts/mcp-server.cjs');
        return 1;
    }
    var targetDir = getTargetDir(target);
    if (!targetDir) {
        console.error("Invalid target: ".concat(target, ". Use: project or user"));
        return 1;
    }
    var mcpJsonPath = path_1.default.join(targetDir, 'mcp.json');
    try {
        // Create directory if needed
        (0, fs_1.mkdirSync)(targetDir, { recursive: true });
        // Load existing config or create new
        var config = { mcpServers: {} };
        if ((0, fs_1.existsSync)(mcpJsonPath)) {
            try {
                config = JSON.parse((0, fs_1.readFileSync)(mcpJsonPath, 'utf-8'));
                if (!config.mcpServers) {
                    config.mcpServers = {};
                }
            }
            catch (error) {
                // [ANTI-PATTERN IGNORED]: Fallback behavior - corrupt config, continue with empty
                logger_js_1.logger.error('SYSTEM', 'Corrupt mcp.json, creating new config', { path: mcpJsonPath }, error);
                config = { mcpServers: {} };
            }
        }
        // Add claude-mem MCP server
        config.mcpServers['claude-mem'] = {
            command: 'node',
            args: [mcpServerPath]
        };
        (0, fs_1.writeFileSync)(mcpJsonPath, JSON.stringify(config, null, 2));
        console.log("  Configured MCP server in ".concat(target === 'user' ? '~/.cursor' : '.cursor', "/mcp.json"));
        console.log("    Server path: ".concat(mcpServerPath));
        return 0;
    }
    catch (error) {
        console.error("Failed to configure MCP: ".concat(error.message));
        return 1;
    }
}
// ============================================================================
// Hook Installation
// ============================================================================
/**
 * Install Cursor hooks using unified CLI
 * No longer copies shell scripts - uses node CLI directly
 */
function installCursorHooks(target) {
    return __awaiter(this, void 0, void 0, function () {
        var targetDir, workerServicePath, workspaceRoot, hooksJsonPath, bunPath, escapedBunPath_1, escapedWorkerPath_1, makeHookCommand, hooksJson, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("\nInstalling Claude-Mem Cursor hooks (".concat(target, " level)...\n"));
                    targetDir = getTargetDir(target);
                    if (!targetDir) {
                        console.error("Invalid target: ".concat(target, ". Use: project, user, or enterprise"));
                        return [2 /*return*/, 1];
                    }
                    workerServicePath = findWorkerServicePath();
                    if (!workerServicePath) {
                        console.error('Could not find worker-service.cjs');
                        console.error('   Expected at: ~/.claude/plugins/marketplaces/thedotmack/plugin/scripts/worker-service.cjs');
                        return [2 /*return*/, 1];
                    }
                    workspaceRoot = process.cwd();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // Create target directory
                    (0, fs_1.mkdirSync)(targetDir, { recursive: true });
                    hooksJsonPath = path_1.default.join(targetDir, 'hooks.json');
                    bunPath = findBunPath();
                    escapedBunPath_1 = bunPath.replace(/\\/g, '\\\\');
                    escapedWorkerPath_1 = workerServicePath.replace(/\\/g, '\\\\');
                    makeHookCommand = function (command) {
                        return "\"".concat(escapedBunPath_1, "\" \"").concat(escapedWorkerPath_1, "\" hook cursor ").concat(command);
                    };
                    console.log("  Using Bun runtime: ".concat(bunPath));
                    hooksJson = {
                        version: 1,
                        hooks: {
                            beforeSubmitPrompt: [
                                { command: makeHookCommand('session-init') },
                                { command: makeHookCommand('context') }
                            ],
                            afterMCPExecution: [
                                { command: makeHookCommand('observation') }
                            ],
                            afterShellExecution: [
                                { command: makeHookCommand('observation') }
                            ],
                            afterFileEdit: [
                                { command: makeHookCommand('file-edit') }
                            ],
                            stop: [
                                { command: makeHookCommand('summarize') }
                            ]
                        }
                    };
                    (0, fs_1.writeFileSync)(hooksJsonPath, JSON.stringify(hooksJson, null, 2));
                    console.log("  Created hooks.json (unified CLI mode)");
                    console.log("  Worker service: ".concat(workerServicePath));
                    if (!(target === 'project')) return [3 /*break*/, 3];
                    return [4 /*yield*/, setupProjectContext(targetDir, workspaceRoot)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    console.log("\nInstallation complete!\n\nHooks installed to: ".concat(targetDir, "/hooks.json\nUsing unified CLI: bun worker-service.cjs hook cursor <command>\n\nNext steps:\n  1. Start claude-mem worker: claude-mem start\n  2. Restart Cursor to load the hooks\n  3. Check Cursor Settings \u2192 Hooks tab to verify\n\nContext Injection:\n  Context from past sessions is stored in .cursor/rules/claude-mem-context.mdc\n  and automatically included in every chat. It updates after each session ends.\n"));
                    return [2 /*return*/, 0];
                case 4:
                    error_2 = _a.sent();
                    console.error("\nInstallation failed: ".concat(error_2.message));
                    if (target === 'enterprise') {
                        console.error('   Tip: Enterprise installation may require sudo/admin privileges');
                    }
                    return [2 /*return*/, 1];
                case 5: return [2 /*return*/];
            }
        });
    });
}
/**
 * Setup initial context file for project-level installation
 */
function setupProjectContext(targetDir, workspaceRoot) {
    return __awaiter(this, void 0, void 0, function () {
        var rulesDir, projectName, contextGenerated, healthResponse, contextResponse, context, error_3, rulesFile, placeholderContent;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    rulesDir = path_1.default.join(targetDir, 'rules');
                    (0, fs_1.mkdirSync)(rulesDir, { recursive: true });
                    projectName = path_1.default.basename(workspaceRoot);
                    contextGenerated = false;
                    console.log("  Generating initial context...");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)('/api/readiness')];
                case 2:
                    healthResponse = _a.sent();
                    if (!healthResponse.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, worker_utils_js_1.workerHttpRequest)("/api/context/inject?project=".concat(encodeURIComponent(projectName)))];
                case 3:
                    contextResponse = _a.sent();
                    if (!contextResponse.ok) return [3 /*break*/, 5];
                    return [4 /*yield*/, contextResponse.text()];
                case 4:
                    context = _a.sent();
                    if (context && context.trim()) {
                        (0, cursor_utils_js_1.writeContextFile)(workspaceRoot, context);
                        contextGenerated = true;
                        console.log("  Generated initial context from existing memory");
                    }
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    // [ANTI-PATTERN IGNORED]: Fallback behavior - worker not running, use placeholder
                    logger_js_1.logger.debug('CURSOR', 'Worker not running during install', {}, error_3);
                    return [3 /*break*/, 7];
                case 7:
                    if (!contextGenerated) {
                        rulesFile = path_1.default.join(rulesDir, 'claude-mem-context.mdc');
                        placeholderContent = "---\nalwaysApply: true\ndescription: \"Claude-mem context from past sessions (auto-updated)\"\n---\n\n# Memory Context from Past Sessions\n\n*No context yet. Complete your first session and context will appear here.*\n\nUse claude-mem's MCP search tools for manual memory queries.\n";
                        (0, fs_1.writeFileSync)(rulesFile, placeholderContent);
                        console.log("  Created placeholder context file (will populate after first session)");
                    }
                    // Register project for automatic context updates after summaries
                    registerCursorProject(projectName, workspaceRoot);
                    console.log("  Registered for auto-context updates");
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * Uninstall Cursor hooks
 */
function uninstallCursorHooks(target) {
    console.log("\nUninstalling Claude-Mem Cursor hooks (".concat(target, " level)...\n"));
    var targetDir = getTargetDir(target);
    if (!targetDir) {
        console.error("Invalid target: ".concat(target));
        return 1;
    }
    try {
        var hooksDir = path_1.default.join(targetDir, 'hooks');
        var hooksJsonPath = path_1.default.join(targetDir, 'hooks.json');
        // Remove legacy shell scripts if they exist (from old installations)
        var bashScripts = ['common.sh', 'session-init.sh', 'context-inject.sh',
            'save-observation.sh', 'save-file-edit.sh', 'session-summary.sh'];
        var psScripts = ['common.ps1', 'session-init.ps1', 'context-inject.ps1',
            'save-observation.ps1', 'save-file-edit.ps1', 'session-summary.ps1'];
        var allScripts = __spreadArray(__spreadArray([], bashScripts, true), psScripts, true);
        for (var _i = 0, allScripts_1 = allScripts; _i < allScripts_1.length; _i++) {
            var script = allScripts_1[_i];
            var scriptPath = path_1.default.join(hooksDir, script);
            if ((0, fs_1.existsSync)(scriptPath)) {
                (0, fs_1.unlinkSync)(scriptPath);
                console.log("  Removed legacy script: ".concat(script));
            }
        }
        // Remove hooks.json
        if ((0, fs_1.existsSync)(hooksJsonPath)) {
            (0, fs_1.unlinkSync)(hooksJsonPath);
            console.log("  Removed hooks.json");
        }
        // Remove context file and unregister if project-level
        if (target === 'project') {
            var contextFile = path_1.default.join(targetDir, 'rules', 'claude-mem-context.mdc');
            if ((0, fs_1.existsSync)(contextFile)) {
                (0, fs_1.unlinkSync)(contextFile);
                console.log("  Removed context file");
            }
            // Unregister from auto-context updates
            var projectName = path_1.default.basename(process.cwd());
            unregisterCursorProject(projectName);
            console.log("  Unregistered from auto-context updates");
        }
        console.log("\nUninstallation complete!\n");
        console.log('Restart Cursor to apply changes.');
        return 0;
    }
    catch (error) {
        console.error("\nUninstallation failed: ".concat(error.message));
        return 1;
    }
}
/**
 * Check Cursor hooks installation status
 */
function checkCursorHooksStatus() {
    var _a, _b, _c;
    console.log('\nClaude-Mem Cursor Hooks Status\n');
    var locations = [
        { name: 'Project', dir: path_1.default.join(process.cwd(), '.cursor') },
        { name: 'User', dir: path_1.default.join((0, os_1.homedir)(), '.cursor') },
    ];
    if (process.platform === 'darwin') {
        locations.push({ name: 'Enterprise', dir: '/Library/Application Support/Cursor' });
    }
    else if (process.platform === 'linux') {
        locations.push({ name: 'Enterprise', dir: '/etc/cursor' });
    }
    var anyInstalled = false;
    var _loop_1 = function (loc) {
        var hooksJson = path_1.default.join(loc.dir, 'hooks.json');
        var hooksDir = path_1.default.join(loc.dir, 'hooks');
        if ((0, fs_1.existsSync)(hooksJson)) {
            anyInstalled = true;
            console.log("".concat(loc.name, ": Installed"));
            console.log("   Config: ".concat(hooksJson));
            // Check if using unified CLI mode or legacy shell scripts
            try {
                var hooksContent = JSON.parse((0, fs_1.readFileSync)(hooksJson, 'utf-8'));
                var firstCommand = ((_c = (_b = (_a = hooksContent === null || hooksContent === void 0 ? void 0 : hooksContent.hooks) === null || _a === void 0 ? void 0 : _a.beforeSubmitPrompt) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.command) || '';
                if (firstCommand.includes('worker-service.cjs') && firstCommand.includes('hook cursor')) {
                    console.log("   Mode: Unified CLI (bun worker-service.cjs)");
                }
                else {
                    // Detect legacy shell scripts
                    var bashScripts = ['session-init.sh', 'context-inject.sh', 'save-observation.sh'];
                    var psScripts = ['session-init.ps1', 'context-inject.ps1', 'save-observation.ps1'];
                    var hasBash = bashScripts.some(function (s) { return (0, fs_1.existsSync)(path_1.default.join(hooksDir, s)); });
                    var hasPs = psScripts.some(function (s) { return (0, fs_1.existsSync)(path_1.default.join(hooksDir, s)); });
                    if (hasBash || hasPs) {
                        console.log("   Mode: Legacy shell scripts (consider reinstalling for unified CLI)");
                        if (hasBash && hasPs) {
                            console.log("   Platform: Both (bash + PowerShell)");
                        }
                        else if (hasBash) {
                            console.log("   Platform: Unix (bash)");
                        }
                        else if (hasPs) {
                            console.log("   Platform: Windows (PowerShell)");
                        }
                    }
                    else {
                        console.log("   Mode: Unknown configuration");
                    }
                }
            }
            catch (_d) {
                console.log("   Mode: Unable to parse hooks.json");
            }
            // Check for context file (project only)
            if (loc.name === 'Project') {
                var contextFile = path_1.default.join(loc.dir, 'rules', 'claude-mem-context.mdc');
                if ((0, fs_1.existsSync)(contextFile)) {
                    console.log("   Context: Active");
                }
                else {
                    console.log("   Context: Not yet generated (will be created on first prompt)");
                }
            }
        }
        else {
            console.log("".concat(loc.name, ": Not installed"));
        }
        console.log('');
    };
    for (var _i = 0, locations_1 = locations; _i < locations_1.length; _i++) {
        var loc = locations_1[_i];
        _loop_1(loc);
    }
    if (!anyInstalled) {
        console.log('No hooks installed. Run: claude-mem cursor install\n');
    }
    return 0;
}
/**
 * Detect if Claude Code is available
 * Checks for the Claude Code CLI and plugin directory
 */
function detectClaudeCode() {
    return __awaiter(this, void 0, void 0, function () {
        var stdout, error_4, pluginDir;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, execAsync('which claude || where claude', { timeout: 5000 })];
                case 1:
                    stdout = (_a.sent()).stdout;
                    if (stdout.trim()) {
                        return [2 /*return*/, true];
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_4 = _a.sent();
                    // [ANTI-PATTERN IGNORED]: Fallback behavior - CLI not found, continue to directory check
                    logger_js_1.logger.debug('SYSTEM', 'Claude CLI not in PATH', {}, error_4);
                    return [3 /*break*/, 3];
                case 3:
                    pluginDir = path_1.default.join(paths_js_1.CLAUDE_CONFIG_DIR, 'plugins');
                    if ((0, fs_1.existsSync)(pluginDir)) {
                        return [2 /*return*/, true];
                    }
                    return [2 /*return*/, false];
            }
        });
    });
}
/**
 * Handle cursor subcommand for hooks installation
 */
function handleCursorCommand(subcommand, args) {
    return __awaiter(this, void 0, void 0, function () {
        var target, target;
        return __generator(this, function (_a) {
            switch (subcommand) {
                case 'install': {
                    target = (args[0] || 'project');
                    return [2 /*return*/, installCursorHooks(target)];
                }
                case 'uninstall': {
                    target = (args[0] || 'project');
                    return [2 /*return*/, uninstallCursorHooks(target)];
                }
                case 'status': {
                    return [2 /*return*/, checkCursorHooksStatus()];
                }
                case 'setup': {
                    // Interactive guided setup - handled by main() in worker-service.ts
                    // This is a placeholder that should not be reached
                    console.log('Use the main entry point for setup');
                    return [2 /*return*/, 0];
                }
                default: {
                    console.log("\nClaude-Mem Cursor Integration\n\nUsage: claude-mem cursor <command> [options]\n\nCommands:\n  setup               Interactive guided setup (recommended for first-time users)\n\n  install [target]    Install Cursor hooks\n                      target: project (default), user, or enterprise\n\n  uninstall [target]  Remove Cursor hooks\n                      target: project (default), user, or enterprise\n\n  status              Check installation status\n\nExamples:\n  npm run cursor:setup                   # Interactive wizard (recommended)\n  npm run cursor:install                 # Install for current project\n  claude-mem cursor install user         # Install globally for user\n  claude-mem cursor uninstall            # Remove from current project\n  claude-mem cursor status               # Check if hooks are installed\n\nFor more info: https://docs.claude-mem.ai/cursor\n      ");
                    return [2 /*return*/, 0];
                }
            }
            return [2 /*return*/];
        });
    });
}
