"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_PATHS = void 0;
var env_paths_1 = require("env-paths");
var path_1 = require("path");
var fsOperations_js_1 = require("./fsOperations.js");
var hash_js_1 = require("./hash.js");
var paths = (0, env_paths_1.default)('claude-cli');
// Local sanitizePath using djb2Hash — NOT the shared version from
// sessionStoragePortable.ts which uses Bun.hash (wyhash) when available.
// Cache directory names must remain stable across upgrades so existing cache
// data (error logs, MCP logs) is not orphaned.
var MAX_SANITIZED_LENGTH = 200;
function sanitizePath(name) {
    var sanitized = name.replace(/[^a-zA-Z0-9]/g, '-');
    if (sanitized.length <= MAX_SANITIZED_LENGTH) {
        return sanitized;
    }
    return "".concat(sanitized.slice(0, MAX_SANITIZED_LENGTH), "-").concat(Math.abs((0, hash_js_1.djb2Hash)(name)).toString(36));
}
function getProjectDir(cwd) {
    return sanitizePath(cwd);
}
exports.CACHE_PATHS = {
    baseLogs: function () { return (0, path_1.join)(paths.cache, getProjectDir((0, fsOperations_js_1.getFsImplementation)().cwd())); },
    errors: function () {
        return (0, path_1.join)(paths.cache, getProjectDir((0, fsOperations_js_1.getFsImplementation)().cwd()), 'errors');
    },
    messages: function () {
        return (0, path_1.join)(paths.cache, getProjectDir((0, fsOperations_js_1.getFsImplementation)().cwd()), 'messages');
    },
    mcpLogs: function (serverName) {
        return (0, path_1.join)(paths.cache, getProjectDir((0, fsOperations_js_1.getFsImplementation)().cwd()), 
        // Sanitize server name for Windows compatibility (colons are reserved for drive letters)
        "mcp-logs-".concat(sanitizePath(serverName)));
    },
};
