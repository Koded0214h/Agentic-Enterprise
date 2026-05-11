"use strict";
/**
 * Cursor Integration Utilities
 *
 * Pure functions for Cursor project registry, context files, and MCP configuration.
 * Designed for testability - all file paths are passed as parameters.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.readCursorRegistry = readCursorRegistry;
exports.writeCursorRegistry = writeCursorRegistry;
exports.registerCursorProject = registerCursorProject;
exports.unregisterCursorProject = unregisterCursorProject;
exports.writeContextFile = writeContextFile;
exports.readContextFile = readContextFile;
exports.configureCursorMcp = configureCursorMcp;
exports.removeMcpConfig = removeMcpConfig;
exports.parseArrayField = parseArrayField;
exports.jsonGet = jsonGet;
exports.getProjectName = getProjectName;
exports.isEmpty = isEmpty;
exports.urlEncode = urlEncode;
var fs_1 = require("fs");
var path_1 = require("path");
var logger_js_1 = require("./logger.js");
// ============================================================================
// Project Registry Functions
// ============================================================================
/**
 * Read the Cursor project registry from a file
 */
function readCursorRegistry(registryFile) {
    try {
        if (!(0, fs_1.existsSync)(registryFile))
            return {};
        return JSON.parse((0, fs_1.readFileSync)(registryFile, 'utf-8'));
    }
    catch (error) {
        logger_js_1.logger.error('CONFIG', 'Failed to read Cursor registry, using empty registry', {
            file: registryFile,
            error: error instanceof Error ? error.message : String(error)
        });
        return {};
    }
}
/**
 * Write the Cursor project registry to a file
 */
function writeCursorRegistry(registryFile, registry) {
    var dir = (0, path_1.join)(registryFile, '..');
    (0, fs_1.mkdirSync)(dir, { recursive: true });
    (0, fs_1.writeFileSync)(registryFile, JSON.stringify(registry, null, 2));
}
/**
 * Register a project in the Cursor registry
 */
function registerCursorProject(registryFile, projectName, workspacePath) {
    var registry = readCursorRegistry(registryFile);
    registry[projectName] = {
        workspacePath: workspacePath,
        installedAt: new Date().toISOString()
    };
    writeCursorRegistry(registryFile, registry);
}
/**
 * Unregister a project from the Cursor registry
 */
function unregisterCursorProject(registryFile, projectName) {
    var registry = readCursorRegistry(registryFile);
    if (registry[projectName]) {
        delete registry[projectName];
        writeCursorRegistry(registryFile, registry);
    }
}
// ============================================================================
// Context File Functions
// ============================================================================
/**
 * Write context file to a Cursor project's .cursor/rules directory
 * Uses atomic write (temp file + rename) to prevent corruption
 */
function writeContextFile(workspacePath, context) {
    var rulesDir = (0, path_1.join)(workspacePath, '.cursor', 'rules');
    var rulesFile = (0, path_1.join)(rulesDir, 'claude-mem-context.mdc');
    var tempFile = "".concat(rulesFile, ".tmp");
    (0, fs_1.mkdirSync)(rulesDir, { recursive: true });
    var content = "---\nalwaysApply: true\ndescription: \"Claude-mem context from past sessions (auto-updated)\"\n---\n\n# Memory Context from Past Sessions\n\nThe following context is from claude-mem, a persistent memory system that tracks your coding sessions.\n\n".concat(context, "\n\n---\n*Updated after last session. Use claude-mem's MCP search tools for more detailed queries.*\n");
    // Atomic write: temp file + rename
    (0, fs_1.writeFileSync)(tempFile, content);
    (0, fs_1.renameSync)(tempFile, rulesFile);
}
/**
 * Read context file from a Cursor project's .cursor/rules directory
 */
function readContextFile(workspacePath) {
    var rulesFile = (0, path_1.join)(workspacePath, '.cursor', 'rules', 'claude-mem-context.mdc');
    if (!(0, fs_1.existsSync)(rulesFile))
        return null;
    return (0, fs_1.readFileSync)(rulesFile, 'utf-8');
}
// ============================================================================
// MCP Configuration Functions
// ============================================================================
/**
 * Configure claude-mem MCP server in Cursor's mcp.json
 * Preserves existing MCP servers
 */
function configureCursorMcp(mcpJsonPath, mcpServerScriptPath) {
    var dir = (0, path_1.join)(mcpJsonPath, '..');
    (0, fs_1.mkdirSync)(dir, { recursive: true });
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
            logger_js_1.logger.error('CONFIG', 'Failed to read MCP config, starting fresh', {
                file: mcpJsonPath,
                error: error instanceof Error ? error.message : String(error)
            });
            config = { mcpServers: {} };
        }
    }
    // Add claude-mem MCP server
    config.mcpServers['claude-mem'] = {
        command: 'node',
        args: [mcpServerScriptPath]
    };
    (0, fs_1.writeFileSync)(mcpJsonPath, JSON.stringify(config, null, 2));
}
/**
 * Remove claude-mem MCP server from Cursor's mcp.json
 * Preserves other MCP servers
 */
function removeMcpConfig(mcpJsonPath) {
    if (!(0, fs_1.existsSync)(mcpJsonPath))
        return;
    try {
        var config = JSON.parse((0, fs_1.readFileSync)(mcpJsonPath, 'utf-8'));
        if (config.mcpServers && config.mcpServers['claude-mem']) {
            delete config.mcpServers['claude-mem'];
            (0, fs_1.writeFileSync)(mcpJsonPath, JSON.stringify(config, null, 2));
        }
    }
    catch (e) {
        logger_js_1.logger.warn('CURSOR', 'Failed to remove MCP config during cleanup', {
            mcpJsonPath: mcpJsonPath,
            error: e instanceof Error ? e.message : String(e)
        });
    }
}
// ============================================================================
// JSON Utility Functions (mirrors common.sh logic)
// ============================================================================
/**
 * Parse array field syntax like "workspace_roots[0]"
 * Returns null for simple fields
 */
function parseArrayField(field) {
    var match = field.match(/^(.+)\[(\d+)\]$/);
    if (!match)
        return null;
    return {
        field: match[1],
        index: parseInt(match[2], 10)
    };
}
/**
 * Extract JSON field with fallback (mirrors common.sh json_get)
 * Supports array access like "field[0]"
 */
function jsonGet(json, field, fallback) {
    if (fallback === void 0) { fallback = ''; }
    var arrayAccess = parseArrayField(field);
    if (arrayAccess) {
        var arr = json[arrayAccess.field];
        if (!Array.isArray(arr))
            return fallback;
        var value_1 = arr[arrayAccess.index];
        if (value_1 === undefined || value_1 === null)
            return fallback;
        return String(value_1);
    }
    var value = json[field];
    if (value === undefined || value === null)
        return fallback;
    return String(value);
}
/**
 * Get project name from workspace path (mirrors common.sh get_project_name)
 */
function getProjectName(workspacePath) {
    if (!workspacePath)
        return 'unknown-project';
    // Handle Windows drive root (C:\ or C:)
    var driveMatch = workspacePath.match(/^([A-Za-z]):[\\\/]?$/);
    if (driveMatch) {
        return "drive-".concat(driveMatch[1].toUpperCase());
    }
    // Normalize to forward slashes for cross-platform support
    var normalized = workspacePath.replace(/\\/g, '/');
    var name = (0, path_1.basename)(normalized);
    if (!name) {
        return 'unknown-project';
    }
    return name;
}
/**
 * Check if string is empty/null (mirrors common.sh is_empty)
 * Also treats jq's literal "null" string as empty
 */
function isEmpty(str) {
    if (str === null || str === undefined)
        return true;
    if (str === '')
        return true;
    if (str === 'null')
        return true;
    if (str === 'empty')
        return true;
    return false;
}
/**
 * URL encode a string (mirrors common.sh url_encode)
 */
function urlEncode(str) {
    return encodeURIComponent(str);
}
